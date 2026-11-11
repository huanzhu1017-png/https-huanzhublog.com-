// Background music for huanzhublog.com: a small Chopin playlist.
// Recordings stream from Wikimedia Commons (public domain / CC BY-SA, credited in the panel).
// Browsers only allow sound after a visitor interacts, so playback starts from the ♪ button.
(function () {
  var C = 'https://upload.wikimedia.org/wikipedia/commons/';
  var TRACKS = [
    { t: 'Nocturne in E-flat, Op. 9 No. 2', len: '4:13', by: 'Martha Goldstein · CC BY-SA',
      src: [C + 'transcoded/5/5c/Frederic_Chopin_-_Nocturne_Eb_major_Opus_9%2C_number_2.ogg/Frederic_Chopin_-_Nocturne_Eb_major_Opus_9%2C_number_2.ogg.mp3',
            C + '5/5c/Frederic_Chopin_-_Nocturne_Eb_major_Opus_9%2C_number_2.ogg'] },
    { t: 'Waltz in A-flat, Op. 42', len: '4:00', by: 'Olga Gurevich · Musopen, public domain',
      src: [C + 'transcoded/1/15/Chopin_Waltz_in_A_flat_major_Op_42.ogg/Chopin_Waltz_in_A_flat_major_Op_42.ogg.mp3',
            C + '1/15/Chopin_Waltz_in_A_flat_major_Op_42.ogg'] },
    { t: 'Waltz in E minor, B. 56', len: '2:56', by: 'Olga Gurevich · Musopen, public domain',
      src: [C + '2/22/Chopin_-_Waltz_in_E_minor%2C_B_56.mp3'] }
  ];
  var KEY = 'hz-music2';
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  var st = load(); var cur = (st.i >= 0 && st.i < TRACKS.length) ? st.i : 0;

  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'music-btn'; btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'hz-pl');
  btn.innerHTML = '<span class="note-ico" aria-hidden="true">♪</span><span class="lbl">play music</span>';
  var panel = document.createElement('div');
  panel.className = 'music-panel'; panel.id = 'hz-pl'; panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Music player');
  panel.innerHTML =
    '<div class="mp-head"><b>Chopin, for reading</b><button type="button" class="mp-x" aria-label="Close player">×</button></div>' +
    '<ol class="mp-list">' + TRACKS.map(function (k, i) {
      return '<li><button type="button" data-i="' + i + '"><span class="mp-t">' + k.t + '</span><span class="mp-len">' + k.len + '</span></button></li>';
    }).join('') + '</ol>' +
    '<div class="mp-ctl"><button type="button" class="mp-play">▶ play</button><button type="button" class="mp-next">next ⏭</button><span class="mp-now" aria-live="polite"></span></div>' +
    '<p class="mp-credit">Recordings via Wikimedia Commons. <span class="mp-by"></span></p>';
  document.body.appendChild(panel); document.body.appendChild(btn);

  var audio = new Audio(); audio.preload = 'none';
  var playing = false;
  var playBtn = panel.querySelector('.mp-play'), now = panel.querySelector('.mp-now'), by = panel.querySelector('.mp-by');

  function setSrc(i) {
    cur = i; audio.innerHTML = '';
    var probe = document.createElement('audio');
    var src = TRACKS[i].src.filter(function (u) { return /\.mp3$/.test(u) ? probe.canPlayType('audio/mpeg') : probe.canPlayType('audio/ogg'); })[0] || TRACKS[i].src[0];
    audio.src = src;
    paint();
  }
  function paint() {
    panel.querySelectorAll('.mp-list button').forEach(function (b) { b.setAttribute('aria-current', +b.dataset.i === cur ? 'true' : 'false'); });
    playBtn.textContent = playing ? '❚❚ pause' : '▶ play';
    now.textContent = playing ? 'now playing: ' + TRACKS[cur].t : '';
    by.textContent = TRACKS[cur].t + ': ' + TRACKS[cur].by + '.';
    btn.querySelector('.lbl').textContent = playing ? 'music on' : 'play music';
    btn.classList.toggle('on', playing);
  }
  function play() {
    if (!audio.src) setSrc(cur);
    audio.volume = 0.6;
    var p = audio.play();
    if (p && p.catch) p.catch(function () { playing = false; paint(); now.textContent = 'Couldn’t start. Tap play again.'; });
    playing = true; save({ on: true, i: cur, at: 0 }); paint();
  }
  function pause() { audio.pause(); playing = false; save({ on: false, i: cur, at: audio.currentTime || 0 }); paint(); }
  function pick(i) { setSrc(i); play(); }

  btn.addEventListener('click', function () {
    var open = panel.hidden; panel.hidden = !open; btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open && !playing) play();
  });
  panel.querySelector('.mp-x').addEventListener('click', function () { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.focus(); });
  panel.querySelector('.mp-list').addEventListener('click', function (e) { var b = e.target.closest('button[data-i]'); if (b) pick(+b.dataset.i); });
  playBtn.addEventListener('click', function () { playing ? pause() : play(); });
  panel.querySelector('.mp-next').addEventListener('click', function () { pick((cur + 1) % TRACKS.length); });
  audio.addEventListener('ended', function () { pick((cur + 1) % TRACKS.length); });
  audio.addEventListener('error', function () { if (playing) { now.textContent = 'That one didn’t load, skipping.'; setTimeout(function () { pick((cur + 1) % TRACKS.length); }, 800); } });
  window.addEventListener('pagehide', function () { if (playing) save({ on: true, i: cur, at: audio.currentTime || 0 }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); } });

  setSrc(cur);
  // Visitor had music on before: continue the same piece on their first tap or key press on this page.
  if (st.on) {
    btn.querySelector('.lbl').textContent = 'tap to resume';
    var resume = function (e) {
      if (e && (btn.contains(e.target) || panel.contains(e.target))) return;
      document.removeEventListener('pointerdown', resume, true); document.removeEventListener('keydown', resume, true);
      if (!playing) { if (st.at) audio.addEventListener('loadedmetadata', function f() { audio.removeEventListener('loadedmetadata', f); try { audio.currentTime = st.at; } catch (x) {} }); play(); }
    };
    document.addEventListener('pointerdown', resume, true); document.addEventListener('keydown', resume, true);
  }
})();
