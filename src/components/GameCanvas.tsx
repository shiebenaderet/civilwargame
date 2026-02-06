import { useRef, useEffect, useCallback, useState } from 'react';
import type { Camera } from '@/types';
import { useGameStore } from '@/engine/gameState';
import { renderMap, screenToHex } from '@/rendering/hexRenderer';
import { hexKey, hexEqual } from '@/utils/hex';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [camera, setCamera] = useState<Camera>({ x: 120, y: 80, zoom: 1.0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cameraStart, setCameraStart] = useState({ x: 0, y: 0 });

  const {
    map, units, selectedUnitId, hoveredHex, currentFaction, phase,
    selectUnit, hoverHex, moveUnit, attackUnit,
    getReachableHexes, getAttackTargets, getUnitAt,
  } = useGameStore();

  // Get reachable hexes and attack targets for selected unit
  const reachableHexes = selectedUnitId ? getReachableHexes(selectedUnitId) : new Map<string, number>();
  const attackTargets = selectedUnitId ? getAttackTargets(selectedUnitId) : [];

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let animFrame: number;
    const draw = () => {
      renderMap(ctx, canvas, map.tiles, units, camera, {
        selectedUnitId,
        reachableHexes,
        attackTargets,
        hoveredHex,
        currentFaction,
      });
      animFrame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, [map, units, camera, selectedUnitId, reachableHexes, attackTargets, hoveredHex, currentFaction]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 2 || e.button === 1) {
      // Right or middle click: start panning
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setCameraStart({ x: camera.x, y: camera.y });
      e.preventDefault();
    }
  }, [camera]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setCamera({ ...camera, x: cameraStart.x + dx, y: cameraStart.y + dy });
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const hex = screenToHex(e.clientX - rect.left, e.clientY - rect.top, camera);
    hoverHex(hex);
  }, [isDragging, dragStart, cameraStart, camera, hoverHex]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (phase === 'game_over' || phase === 'setup') return;

    const rect = canvas.getBoundingClientRect();
    const hex = screenToHex(e.clientX - rect.left, e.clientY - rect.top, camera);
    const clickedUnit = getUnitAt(hex);

    if (selectedUnitId) {
      // Check if clicking an enemy unit to attack
      if (clickedUnit && clickedUnit.faction !== currentFaction && phase === 'combat') {
        const targets = getAttackTargets(selectedUnitId);
        if (targets.some((t) => hexEqual(t, hex))) {
          attackUnit(selectedUnitId, clickedUnit.id);
          selectUnit(null);
          return;
        }
      }

      // Check if clicking a reachable hex to move
      if (phase === 'movement') {
        const reachable = getReachableHexes(selectedUnitId);
        if (reachable.has(hexKey(hex))) {
          moveUnit(selectedUnitId, hex);
          selectUnit(null);
          return;
        }
      }

      // Click on another friendly unit to select it
      if (clickedUnit && clickedUnit.faction === currentFaction) {
        selectUnit(clickedUnit.id);
        return;
      }

      // Deselect
      selectUnit(null);
    } else {
      // Select a friendly unit
      if (clickedUnit && clickedUnit.faction === currentFaction) {
        selectUnit(clickedUnit.id);
      }
    }
  }, [camera, selectedUnitId, phase, currentFaction, units, selectUnit, moveUnit, attackUnit, getUnitAt, getReachableHexes, getAttackTargets]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.4, Math.min(2.5, camera.zoom * delta));

    // Zoom toward mouse position
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    setCamera({
      x: mx - (mx - camera.x) * (newZoom / camera.zoom),
      y: my - (my - camera.y) * (newZoom / camera.zoom),
      zoom: newZoom,
    });
  }, [camera]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', cursor: isDragging ? 'grabbing' : 'default' }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}
