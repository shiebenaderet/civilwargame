/**
 * Web Audio API sound engine - synthesized sounds, no external files needed.
 */
export const SoundEngine = {
    ctx: null,
    muted: false,

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            // Web Audio not supported
        }
    },

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    playCannonBoom() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const c = this.ctx;
        const now = c.currentTime;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.5);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(now);
        osc.stop(now + 0.5);
    },

    playVictoryFanfare() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const c = this.ctx;
        const now = c.currentTime;
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.3, now + i * 0.2);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.5);
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start(now + i * 0.2);
            osc.stop(now + i * 0.2 + 0.5);
        });
    },

    playDefeatDrum() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const c = this.ctx;
        const now = c.currentTime;
        for (let i = 0; i < 3; i++) {
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(60, now + i * 0.4);
            osc.frequency.exponentialRampToValueAtTime(30, now + i * 0.4 + 0.3);
            gain.gain.setValueAtTime(0.4, now + i * 0.4);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.4 + 0.3);
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start(now + i * 0.4);
            osc.stop(now + i * 0.4 + 0.3);
        }
    },

    playClick() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const c = this.ctx;
        const now = c.currentTime;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(now);
        osc.stop(now + 0.05);
    },

    toggleMute() {
        this.muted = !this.muted;
        const btn = document.getElementById('muteBtn');
        if (btn) btn.innerHTML = this.muted ? '\uD83D\uDD07' : '\uD83D\uDD08';
        localStorage.setItem('cwgMuted', this.muted ? '1' : '0');
    }
};
