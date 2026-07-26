/* Tiny synthesized SFX engine (Web Audio API, no audio files needed). */
var SFX = (function () {
  var ctx = null;
  var enabled = localStorage.getItem('sa-sound') !== 'off';

  function ensureCtx() {
    if (!ctx) {
      var Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol, delay) {
    if (!enabled) return;
    var c = ensureCtx(); if (!c) return;
    var t0 = c.currentTime + (delay || 0);
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol || 0.2, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain); gain.connect(c.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.03);
  }

  function sweep(f1, f2, dur, type, vol, delay) {
    if (!enabled) return;
    var c = ensureCtx(); if (!c) return;
    var t0 = c.currentTime + (delay || 0);
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(f1, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(f2, 1), t0 + dur);
    gain.gain.setValueAtTime(vol || 0.2, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain); gain.connect(c.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.03);
  }

  function noiseHit(dur, vol) {
    if (!enabled) return;
    var c = ensureCtx(); if (!c) return;
    var buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    var src = c.createBufferSource(); src.buffer = buf;
    var gain = c.createGain(); gain.gain.setValueAtTime(vol || 0.2, c.currentTime);
    src.connect(gain); gain.connect(c.destination);
    src.start();
  }

  return {
    click: function () { tone(440, 0.055, 'square', 0.10); },
    move: function () { tone(300, 0.05, 'square', 0.08); },
    select: function () { tone(880, 0.05, 'sine', 0.09); },
    pop: function (n) { sweep(700, 250, 0.11, 'sine', 0.2); if (n) tone(1000, 0.06, 'sine', 0.12, 0.03); },
    hit: function () { noiseHit(0.08, 0.18); },
    match: function () { tone(523, 0.09, 'triangle', 0.18); tone(659, 0.09, 'triangle', 0.16, 0.09); tone(784, 0.12, 'triangle', 0.16, 0.18); },
    win: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, 'triangle', 0.18, i * 0.11); }); },
    lose: function () { sweep(320, 70, 0.45, 'sawtooth', 0.15); },
    bounce: function () { tone(220, 0.04, 'triangle', 0.07); },
    tick: function () { tone(660, 0.03, 'square', 0.05); },
    toggle: function (v) { enabled = v; localStorage.setItem('sa-sound', v ? 'on' : 'off'); },
    isEnabled: function () { return enabled; }
  };
})();

(function () {
  var btn = document.getElementById('soundBtn');
  if (!btn) return;
  function render() {
    btn.querySelector('.i-sound-on').style.display = SFX.isEnabled() ? 'block' : 'none';
    btn.querySelector('.i-sound-off').style.display = SFX.isEnabled() ? 'none' : 'block';
  }
  render();
  btn.addEventListener('click', function () {
    SFX.toggle(!SFX.isEnabled());
    if (SFX.isEnabled()) SFX.select();
    render();
  });
})();
