// Soft background music for huanzhublog.com.
// The tune is generated live in the browser (Web Audio), so there is no audio file and nothing licensed.
// Browsers only allow sound after a visitor interacts, so it starts from the "♪" button,
// and remembers the choice for the next page.
(function () {
  var KEY = 'hz-music';
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'music-btn';
  btn.setAttribute('aria-pressed', 'false');
  btn.innerHTML = '<span class="note-ico" aria-hidden="true">♪</span><span class="lbl">play music</span>';
  document.body.appendChild(btn);

  var ctx = null, master = null, timer = null, nextTime = 0, step = 0, playing = false;
  var BPM = 66, EIGHTH = 60 / BPM / 2;
  // Cmaj7 – Am7 – Fmaj7 – G6 – Em7 – Am7 – Dm7 – G
  var CHORDS = [
    [48, 60, 64, 67, 71], [45, 57, 60, 64, 67], [41, 57, 60, 64, 69], [43, 55, 59, 62, 64],
    [40, 55, 59, 62, 64], [45, 57, 60, 64, 67], [38, 57, 60, 62, 65], [43, 55, 59, 62, 67]
  ];
  var MELODY = [72, 74, 76, 79, 81, 84];
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function build() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
    var delay = ctx.createDelay(1.5); delay.delayTime.value = EIGHTH * 3;
    var fb = ctx.createGain(); fb.gain.value = 0.32;
    var wet = ctx.createGain(); wet.gain.value = 0.35;
    master.connect(lp); lp.connect(ctx.destination);
    lp.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(ctx.destination);
    return true;
  }

  function note(m, t, len, vol) {
    var o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    o1.type = 'triangle'; o2.type = 'sine';
    o1.frequency.value = hz(m); o2.frequency.value = hz(m + 12);
    var g2 = ctx.createGain(); g2.gain.value = 0.25;
    o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(master);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o1.start(t); o2.start(t); o1.stop(t + len + 0.05); o2.stop(t + len + 0.05);
  }

  function schedule() {
    while (nextTime < ctx.currentTime + 0.25) {
      var bar = Math.floor(step / 8) % CHORDS.length, pos = step % 8, c = CHORDS[bar];
      if (pos === 0) note(c[0], nextTime, EIGHTH * 8, 0.16);
      var tones = c.slice(1);
      note(tones[[0, 1, 2, 3, 2, 1, 2, 3][pos] % tones.length], nextTime, EIGHTH * 3.5, 0.07 + rnd() * 0.03);
      if ((pos === 2 || pos === 5) && rnd() < 0.45) note(MELODY[Math.floor(rnd() * MELODY.length)], nextTime, EIGHTH * 5, 0.05);
      nextTime += EIGHTH; step++;
    }
  }

  function start() {
    if (!ctx && !build()) return;
    var go = function () {
      playing = true;
      nextTime = ctx.currentTime + 0.1;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2.5);
      clearInterval(timer); timer = setInterval(schedule, 80); schedule();
      btn.setAttribute('aria-pressed', 'true'); btn.querySelector('.lbl').textContent = 'music on';
    };
    if (ctx.state === 'suspended') ctx.resume().then(go, function () {}); else go();
  }

  function stop() {
    playing = false;
    btn.setAttribute('aria-pressed', 'false'); btn.querySelector('.lbl').textContent = 'play music';
    if (!ctx) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    setTimeout(function () { if (!playing) { clearInterval(timer); ctx.suspend(); } }, 900);
  }

  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  btn.addEventListener('click', function () { if (playing) { stop(); save('off'); } else { start(); save('on'); } });

  // If the visitor turned music on earlier, pick it back up on their first tap or click on this page.
  var pref = null; try { pref = localStorage.getItem(KEY); } catch (e) {}
  if (pref === 'on') {
    var resume = function (e) {
      if (e && btn.contains(e.target)) return;
      document.removeEventListener('pointerdown', resume, true);
      document.removeEventListener('keydown', resume, true);
      if (!playing) start();
    };
    document.addEventListener('pointerdown', resume, true);
    document.addEventListener('keydown', resume, true);
  }
})();
