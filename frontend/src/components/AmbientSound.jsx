import { useState, useRef, useEffect } from 'react';

export default function AmbientSound() {
  const [playing, setPlaying] = useState(false);
  const audioCtxRef = useRef(null);

  function start() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    // Pink noise (Paul Kellet's refined method) — brighter and more natural
    // than brown noise, the standard basis for rain/static-style ambience.
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      output[i] = pink * 0.08;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Band-pass shaping: cut low rumble and harsh hiss, leaving a soft "rain" band
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 400;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 3500;

    // A slow, gentle volume drift so it doesn't sound like a flat static loop
    const gain = ctx.createGain();
    gain.gain.value = 0.18;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.04;
    lfo.connect(lfoGain).connect(gain.gain);
    lfo.start();

    noise.connect(highpass).connect(lowpass).connect(gain).connect(ctx.destination);
    noise.start();

    audioCtxRef.current = ctx;
    setPlaying(true);
  }

  function stop() {
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    setPlaying(false);
  }

  // Stop the sound automatically if this component unmounts for any reason —
  // navigating to another page, finishing the session, etc.
  useEffect(() => {
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  return (
    <button
      onClick={() => (playing ? stop() : start())}
      className={`text-xs px-3 py-1.5 rounded-sm border transition-colors ${
        playing ? 'border-ember text-ember' : 'border-sand/30 text-sand hover:text-paper'
      }`}
      title="Ambient study sound"
    >
      {playing ? '🔊 Sound on' : '🔈 Sound off'}
    </button>
  );
}