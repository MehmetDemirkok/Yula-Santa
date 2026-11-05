/** Small synth for the wheel's tick and win sounds; needs no audio files. */
export function createWheelAudio() {
    let ctx: AudioContext | null = null;

    const ensure = () => {
        if (!ctx) ctx = new AudioContext();
        if (ctx.state === "suspended") void ctx.resume();
        return ctx;
    };

    /** Must run inside a tap or click, or mobile browsers keep the audio muted. */
    const unlock = () => {
        try {
            ensure();
        } catch {
            /* sound is optional */
        }
    };

    const tick = (intensity = 0.6) => {
        try {
            const ac = ensure();
            const t0 = ac.currentTime;
            const osc = ac.createOscillator();
            const gain = ac.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(1500 + intensity * 500, t0);
            osc.frequency.exponentialRampToValueAtTime(520, t0 + 0.03);
            gain.gain.setValueAtTime(0.0001, t0);
            gain.gain.exponentialRampToValueAtTime(0.1 * intensity + 0.02, t0 + 0.003);
            gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.045);
            osc.connect(gain);
            gain.connect(ac.destination);
            osc.start(t0);
            osc.stop(t0 + 0.05);
        } catch {
            /* sound is optional */
        }
    };

    const win = () => {
        try {
            const ac = ensure();
            const t0 = ac.currentTime;
            [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
                const osc = ac.createOscillator();
                const gain = ac.createGain();
                osc.type = "sine";
                osc.frequency.value = freq;
                const start = t0 + i * 0.09;
                gain.gain.setValueAtTime(0.0001, start);
                gain.gain.exponentialRampToValueAtTime(0.1, start + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
                osc.connect(gain);
                gain.connect(ac.destination);
                osc.start(start);
                osc.stop(start + 0.55);
            });
        } catch {
            /* sound is optional */
        }
    };

    const dispose = () => {
        void ctx?.close();
        ctx = null;
    };

    return { unlock, tick, win, dispose };
}
