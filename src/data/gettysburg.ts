import type { Scenario } from '@/types';

/**
 * Battle of Gettysburg - July 1-3, 1863
 * The bloodiest battle of the Civil War and a turning point.
 *
 * Map: ~20x16 hex grid representing the area around Gettysburg, PA
 * Key features: Cemetery Ridge, Seminary Ridge, Little Round Top,
 * Devil's Den, Peach Orchard, Wheat Field
 */
export const gettysburgScenario: Scenario = {
  id: 'gettysburg',
  name: 'Battle of Gettysburg',
  description: 'July 1-3, 1863 - The turning point of the Civil War. Command the Union Army of the Potomac against Lee\'s Army of Northern Virginia in the bloodiest battle ever fought on American soil.',
  year: 1863,
  historicalContext: 'General Robert E. Lee has invaded the North, hoping a decisive victory will break the Union\'s will to fight. The two armies collide at the crossroads town of Gettysburg, Pennsylvania.',
  mapWidth: 20,
  mapHeight: 16,
  maxTurns: 12,
  playerFaction: 'union',

  terrain: [
    // Gettysburg town (center-north)
    { q: 10, r: 3, terrain: 'town', label: 'Gettysburg', victoryPoint: true },
    { q: 11, r: 3, terrain: 'town', label: 'Gettysburg' },
    { q: 10, r: 4, terrain: 'road' },

    // Roads leading to town
    { q: 9, r: 3, terrain: 'road' },
    { q: 8, r: 3, terrain: 'road' },
    { q: 12, r: 3, terrain: 'road' },
    { q: 13, r: 3, terrain: 'road' },
    { q: 10, r: 2, terrain: 'road' },
    { q: 10, r: 5, terrain: 'road' },
    { q: 10, r: 6, terrain: 'road' },
    { q: 10, r: 7, terrain: 'road' },

    // Seminary Ridge (Confederate position - west)
    { q: 7, r: 4, terrain: 'hills', elevation: 2, label: 'Seminary Ridge' },
    { q: 7, r: 5, terrain: 'hills', elevation: 2 },
    { q: 7, r: 6, terrain: 'hills', elevation: 2 },
    { q: 7, r: 7, terrain: 'hills', elevation: 2 },
    { q: 7, r: 8, terrain: 'hills', elevation: 2 },
    { q: 7, r: 9, terrain: 'hills', elevation: 1 },

    // Cemetery Ridge (Union position - east/center)
    { q: 11, r: 5, terrain: 'hills', elevation: 2, label: 'Cemetery Hill', victoryPoint: true },
    { q: 11, r: 6, terrain: 'hills', elevation: 2, label: 'Cemetery Ridge' },
    { q: 11, r: 7, terrain: 'hills', elevation: 2 },
    { q: 11, r: 8, terrain: 'hills', elevation: 2 },
    { q: 11, r: 9, terrain: 'hills', elevation: 1 },

    // Little Round Top (key defensive position)
    { q: 12, r: 10, terrain: 'hills', elevation: 3, label: 'Little Round Top', victoryPoint: true },
    { q: 13, r: 10, terrain: 'hills', elevation: 2, label: 'Big Round Top' },

    // Devil's Den
    { q: 10, r: 10, terrain: 'hills', elevation: 1, label: "Devil's Den" },
    { q: 10, r: 11, terrain: 'hills', elevation: 1 },

    // Peach Orchard
    { q: 9, r: 9, terrain: 'forest', label: 'Peach Orchard' },
    { q: 9, r: 8, terrain: 'forest' },

    // Wheat Field
    { q: 10, r: 9, terrain: 'plains', label: 'Wheat Field' },

    // Forests scattered around
    { q: 5, r: 5, terrain: 'forest' },
    { q: 5, r: 6, terrain: 'forest' },
    { q: 6, r: 7, terrain: 'forest' },
    { q: 6, r: 8, terrain: 'forest' },
    { q: 13, r: 11, terrain: 'forest' },
    { q: 14, r: 11, terrain: 'forest' },
    { q: 14, r: 10, terrain: 'forest' },
    { q: 8, r: 10, terrain: 'forest' },
    { q: 8, r: 11, terrain: 'forest' },
    { q: 3, r: 4, terrain: 'forest' },
    { q: 4, r: 3, terrain: 'forest' },
    { q: 15, r: 5, terrain: 'forest' },
    { q: 16, r: 6, terrain: 'forest' },

    // Culp's Hill
    { q: 13, r: 5, terrain: 'hills', elevation: 2, label: "Culp's Hill", victoryPoint: true },
    { q: 13, r: 6, terrain: 'hills', elevation: 1 },

    // Rock Creek
    { q: 14, r: 4, terrain: 'river', label: 'Rock Creek' },
    { q: 14, r: 5, terrain: 'river' },
    { q: 14, r: 6, terrain: 'river' },
    { q: 14, r: 7, terrain: 'river' },
    { q: 13, r: 8, terrain: 'river' },
    { q: 13, r: 9, terrain: 'river' },

    // Swampy areas
    { q: 15, r: 8, terrain: 'swamp' },
    { q: 15, r: 9, terrain: 'swamp' },

    // Emmitsburg Road
    { q: 9, r: 5, terrain: 'road', label: 'Emmitsburg Rd' },
    { q: 9, r: 6, terrain: 'road' },
    { q: 9, r: 7, terrain: 'road' },
  ],

  units: [
    // ====== UNION FORCES ======
    // I Corps
    {
      name: '1st Division, I Corps',
      type: 'infantry',
      faction: 'union',
      commander: 'Gen. Wadsworth',
      strength: 850,
      experience: 60,
      q: 11, r: 5,
    },
    {
      name: '2nd Division, I Corps',
      type: 'infantry',
      faction: 'union',
      commander: 'Gen. Robinson',
      strength: 750,
      experience: 55,
      q: 11, r: 6,
    },
    // II Corps
    {
      name: '1st Division, II Corps',
      type: 'infantry',
      faction: 'union',
      commander: 'Gen. Caldwell',
      strength: 900,
      experience: 65,
      q: 11, r: 7,
    },
    {
      name: '2nd Division, II Corps',
      type: 'infantry',
      faction: 'union',
      commander: 'Gen. Gibbon',
      strength: 850,
      experience: 70,
      q: 11, r: 8,
    },
    // III Corps
    {
      name: '1st Division, III Corps',
      type: 'infantry',
      faction: 'union',
      commander: 'Gen. Birney',
      strength: 800,
      experience: 50,
      q: 10, r: 9,
    },
    // V Corps
    {
      name: '1st Division, V Corps',
      type: 'infantry',
      faction: 'union',
      commander: 'Gen. Barnes',
      strength: 700,
      experience: 45,
      q: 12, r: 10,
    },
    // XII Corps - Culp's Hill
    {
      name: '1st Division, XII Corps',
      type: 'infantry',
      faction: 'union',
      commander: 'Gen. Williams',
      strength: 800,
      experience: 55,
      q: 13, r: 5,
    },
    // Cavalry
    {
      name: 'Buford\'s Cavalry Division',
      type: 'cavalry',
      faction: 'union',
      commander: 'Gen. Buford',
      strength: 400,
      experience: 70,
      q: 15, r: 3,
    },
    // Artillery
    {
      name: 'Artillery Reserve',
      type: 'artillery',
      faction: 'union',
      commander: 'Gen. Hunt',
      strength: 180,
      experience: 65,
      q: 12, r: 7,
    },

    // ====== CONFEDERATE FORCES ======
    // Longstreet's Corps
    {
      name: '1st Division, I Corps',
      type: 'infantry',
      faction: 'confederate',
      commander: 'Gen. McLaws',
      strength: 850,
      experience: 70,
      q: 7, r: 7,
    },
    {
      name: '2nd Division, I Corps',
      type: 'infantry',
      faction: 'confederate',
      commander: 'Gen. Hood',
      strength: 900,
      experience: 75,
      q: 7, r: 8,
    },
    {
      name: '3rd Division, I Corps',
      type: 'infantry',
      faction: 'confederate',
      commander: 'Gen. Pickett',
      strength: 950,
      experience: 65,
      q: 6, r: 6,
    },
    // A.P. Hill's Corps
    {
      name: '1st Division, III Corps',
      type: 'infantry',
      faction: 'confederate',
      commander: 'Gen. Anderson',
      strength: 800,
      experience: 60,
      q: 7, r: 5,
    },
    {
      name: '2nd Division, III Corps',
      type: 'infantry',
      faction: 'confederate',
      commander: 'Gen. Heth',
      strength: 750,
      experience: 55,
      q: 7, r: 4,
    },
    // Ewell's Corps
    {
      name: '1st Division, II Corps',
      type: 'infantry',
      faction: 'confederate',
      commander: 'Gen. Early',
      strength: 850,
      experience: 65,
      q: 8, r: 2,
    },
    {
      name: '2nd Division, II Corps',
      type: 'infantry',
      faction: 'confederate',
      commander: 'Gen. Johnson',
      strength: 800,
      experience: 60,
      q: 9, r: 2,
    },
    // Stuart's Cavalry
    {
      name: "Stuart's Cavalry Division",
      type: 'cavalry',
      faction: 'confederate',
      commander: 'Gen. Stuart',
      strength: 450,
      experience: 80,
      q: 4, r: 4,
    },
    // Confederate Artillery
    {
      name: 'Artillery Battalion',
      type: 'artillery',
      faction: 'confederate',
      commander: 'Col. Alexander',
      strength: 160,
      experience: 70,
      q: 8, r: 6,
    },
  ],

  victoryCondition: {
    type: 'victory_points',
    description: 'Control the most victory point locations (Gettysburg, Cemetery Hill, Little Round Top, Culp\'s Hill) by the end of turn 12, or eliminate all enemy forces.',
  },

  historicalEvents: [
    {
      id: 'day1_opening',
      turn: 1,
      title: 'First Contact',
      description: 'Confederate forces advancing on Gettysburg encounter Union cavalry under General Buford. The battle for the crossroads begins.',
      triggered: false,
    },
    {
      id: 'reynolds_falls',
      turn: 2,
      title: 'Reynolds Falls',
      description: 'Historically, Union General John Reynolds was killed early in the battle while directing troops near McPherson\'s Ridge. His death shocked the Army of the Potomac.',
      triggered: false,
    },
    {
      id: 'day2_assault',
      turn: 4,
      title: 'Longstreet\'s Assault',
      description: 'General Longstreet launches a massive assault against the Union left flank. The fighting around Devil\'s Den, the Wheat Field, and the Peach Orchard is among the fiercest of the war.',
      triggered: false,
    },
    {
      id: 'little_round_top',
      turn: 5,
      title: 'Stand at Little Round Top',
      description: 'Colonel Joshua Chamberlain and the 20th Maine hold Little Round Top against repeated Confederate assaults. When ammunition runs low, Chamberlain orders a bayonet charge!',
      effect: 'Union units on Little Round Top gain +2 defense this turn.',
      triggered: false,
    },
    {
      id: 'day3_cannonade',
      turn: 8,
      title: 'The Great Cannonade',
      description: 'Over 150 Confederate guns open fire in the largest artillery bombardment of the war. The ground shakes for two hours before Pickett\'s Charge begins.',
      triggered: false,
    },
    {
      id: 'picketts_charge',
      turn: 9,
      title: 'Pickett\'s Charge',
      description: 'Nearly 12,500 Confederate soldiers advance across open ground toward Cemetery Ridge. "It is all my fault," Lee would later say. This is the high-water mark of the Confederacy.',
      triggered: false,
    },
    {
      id: 'aftermath',
      turn: 12,
      title: 'The Aftermath',
      description: 'After three days of fighting, over 50,000 men are casualties. Lee retreats south. Four months later, President Lincoln will deliver the Gettysburg Address on this ground: "...that government of the people, by the people, for the people, shall not perish from the earth."',
      triggered: false,
    },
  ],
};
