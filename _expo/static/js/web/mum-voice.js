/* Hands-free voice for Mum's counselling quiz only. */
(function () {
  var synth = window.speechSynthesis || null;
  var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  var stopFlag = false;
  var running = false;
  var rec = null;
  var wake = null;
  var banner = null;
  var startBtn = null;
  var lastQuestion = '';
  var armed = false;
  var audioCtx = null;
  var unlocked = false;

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function pageText() {
    return (document.body && document.body.innerText) || '';
  }

  function isMumPage() {
    var t = pageText();
    if (/Who are you\?/.test(t)) armed = false;
    if (/Mum \u00b7 Counselling/.test(t) || t.indexOf('Counselling & Guidance') !== -1 || t.indexOf('Counselling \u00b7') !== -1) armed = true;
    if (/(Matt|Lyla|Ken) \u00b7/.test(t) && t.indexOf('Mum \u00b7') === -1 && t.indexOf('Counselling') === -1) armed = false;
    return armed || t.indexOf('Counselling & Guidance') !== -1;
  }

  function isQuizScreen() {
    var t = pageText();
    return isMumPage() && t.indexOf('\u2190 Length') !== -1 && /\d+\s*\/\s*\d+/.test(t);
  }

  function isPickScreen() {
    return isMumPage() && pageText().indexOf('Session length') !== -1;
  }

  function ensureUi() {
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'lh-voice-banner';
      banner.style.cssText = 'position:fixed;left:10px;right:10px;bottom:118px;z-index:2147483000;background:#152238;color:#d6e4f5;border:1px solid #C77DFF;border-radius:14px;padding:10px 12px;font:600 14px system-ui,sans-serif;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.35);display:none';
      banner.addEventListener('click', function (e) {
        e.preventDefault();
        unlockAndSpeak('Sound is on. I will read the question next.');
      });
      document.body.appendChild(banner);
    }
    if (!startBtn) {
      startBtn = document.createElement('button');
      startBtn.id = 'lh-voice-start';
      startBtn.type = 'button';
      startBtn.textContent = 'Tap to start voice';
      startBtn.style.cssText = 'position:fixed;left:10px;right:10px;bottom:56px;z-index:2147483001;background:#C77DFF;color:#1b0b28;border:0;border-radius:16px;padding:16px 12px;font:800 18px system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.35);display:none';
      startBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        unlocked = true;
        unlockAudio();
        try {
          if (synth) {
            var kick = new SpeechSynthesisUtterance('Voice is on.');
            kick.lang = 'en-US';
            kick.volume = 1;
            kick.rate = 0.95;
            synth.speak(kick);
            synth.resume();
          }
        } catch (err) {}
        if (isQuizScreen() && !running) {
          setTimeout(function () { runLoop(true); }, 800);
        } else {
          setBanner('Sound should be on. Pick 10, 20, 40 or Full, then tap the purple button again.');
        }
      });
      document.body.appendChild(startBtn);
    }
  }

  function setBanner(text) {
    ensureUi();
    if (!text) {
      banner.style.display = 'none';
      banner.textContent = '';
      return;
    }
    banner.style.display = 'block';
    banner.textContent = text;
  }

  function showStart(on) {
    ensureUi();
    startBtn.style.display = on ? 'block' : 'none';
  }

  function beep() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var o = audioCtx.createOscillator();
      var g = audioCtx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.value = 0.08;
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start();
      setTimeout(function () { try { o.stop(); } catch (e) {} }, 160);
    } catch (e) {}
  }

  function unlockAudio() {
    unlocked = true;
    beep();
    if (synth) {
      try { synth.cancel(); } catch (e) {}
      try { synth.resume(); } catch (e) {}
    }
    try { if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume(); } catch (e) {}
  }

  if (synth) {
    try { synth.getVoices(); } catch (e) {}
    try { synth.addEventListener('voiceschanged', function () { synth.getVoices(); }); } catch (e) {}
    setInterval(function () {
      try { if (synth.speaking || synth.pending) synth.resume(); } catch (e) {}
    }, 300);
  }

  function chunks(text) {
    var s = String(text || '').replace(/\s+/g, ' ').trim();
    var out = [];
    while (s.length) {
      if (s.length <= 140) { out.push(s); break; }
      var cut = Math.max(s.lastIndexOf('. ', 140), s.lastIndexOf('? ', 140), s.lastIndexOf(', ', 140), s.lastIndexOf(' ', 140));
      if (cut < 30) cut = 140;
      out.push(s.slice(0, cut + 1).trim());
      s = s.slice(cut + 1).trim();
    }
    return out;
  }

  function speakOne(piece) {
    return new Promise(function (resolve) {
      if (stopFlag || !piece) return resolve();
      if (!synth) return resolve();
      var u = new SpeechSynthesisUtterance(piece);
      u.lang = 'en-US';
      u.rate = 0.9;
      u.pitch = 1;
      u.volume = 1;
      var done = false;
      function finish() { if (done) return; done = true; resolve(); }
      u.onend = finish;
      u.onerror = finish;
      try { synth.resume(); } catch (e) {}
      try { synth.speak(u); } catch (e) { finish(); return; }
      setTimeout(finish, Math.min(12000, 1400 + piece.length * 80));
    });
  }

  async function speak(text) {
    if (stopFlag) return;
    var parts = chunks(text);
    for (var i = 0; i < parts.length; i++) {
      if (stopFlag) return;
      await speakOne(parts[i]);
      await wait(80);
    }
  }

  function unlockAndSpeak(text) {
    unlockAudio();
    speak(text);
  }

  function digitsIn(text) {
    var t = ' ' + String(text || '').toLowerCase() + ' ';
    if (/\b(5|five|fife|repeat|again|replay)\b/.test(t)) return 5;
    if (/\b(1|one|won|wun|first)\b/.test(t)) return 1;
    if (/\b(2|two|too|second)\b/.test(t)) return 2;
    if (/\b(3|three|tree|third)\b/.test(t)) return 3;
    if (/\b(4|four|fore|fourth)\b/.test(t)) return 4;
    var m = t.match(/\b[1-5]\b/);
    return m ? Number(m[0]) : 0;
  }

  function parseChoice(text, choices) {
    var raw = String(text || '').toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!raw) return 0;
    if (/\b(repeat|again|replay|options|answers)\b/.test(raw)) return 5;
    var n = digitsIn(raw);
    if (n) return n;
    if (choices && choices.length) {
      var best = 0, bestScore = 0;
      choices.forEach(function (c, i) {
        var ct = String(c.text || '').toLowerCase().replace(/[^\w\s]/g, ' ');
        var words = raw.split(' ').filter(function (w) { return w.length > 3; });
        var hit = 0;
        words.forEach(function (w) { if (ct.indexOf(w) !== -1) hit += 1; });
        if (hit > bestScore && hit >= 2) { bestScore = hit; best = i + 1; }
      });
      if (best) return best;
    }
    return 0;
  }

  function listenOnce(choices) {
    return new Promise(function (resolve) {
      if (stopFlag) return resolve({ n: 0, heard: '' });
      if (!Rec) return resolve({ n: 0, heard: '' });
      try { if (rec) rec.stop(); } catch (e) {}
      rec = new Rec();
      rec.lang = 'en-US';
      rec.interimResults = true;
      rec.maxAlternatives = 5;
      rec.continuous = true;
      var done = false;
      var lastHeard = '';
      function finish(n, heard) {
        if (done) return;
        done = true;
        try { rec.stop(); } catch (e) {}
        resolve({ n: n || 0, heard: heard || lastHeard || '' });
      }
      rec.onresult = function (ev) {
        var said = [];
        try {
          for (var i = 0; i < ev.results.length; i++) {
            for (var j = 0; j < ev.results[i].length; j++) {
              said.push(ev.results[i][j].transcript || '');
            }
          }
        } catch (e) {}
        lastHeard = said.join(' ');
        var n = 0;
        said.forEach(function (s) { if (!n) n = parseChoice(s, choices); });
        if (lastHeard) setBanner('Heard: ' + lastHeard + (n ? '  \u2192  ' + n : '  \u2014  say 1, 2, 3 or 4'));
        if (n) finish(n, lastHeard);
      };
      rec.onerror = function () { finish(0, lastHeard); };
      rec.onend = function () { if (!done) finish(0, lastHeard); };
      try { rec.start(); } catch (e) { finish(0, ''); }
      setTimeout(function () { finish(0, lastHeard); }, 10000);
    });
  }

  async function lockScreen() {
    try {
      if (navigator.wakeLock && navigator.wakeLock.request) wake = await navigator.wakeLock.request('screen');
    } catch (e) {}
  }

  function tap(el) {
    if (!el) return;
    try { el.scrollIntoView({ block: 'center', inline: 'nearest' }); } catch (e) {}
    var x = 0, y = 0;
    try {
      var r = el.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height / 2;
    } catch (e) {}
    var opts = { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, pointerType: 'touch', buttons: 1 };
    ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(function (type) {
      try {
        if (type.indexOf('pointer') === 0 && window.PointerEvent) el.dispatchEvent(new PointerEvent(type, opts));
        else el.dispatchEvent(new MouseEvent(type, opts));
      } catch (e) {}
    });
    try { el.click(); } catch (e) {}
  }

  function pressables() {
    return Array.prototype.slice.call(document.querySelectorAll('div')).filter(function (el) {
      return /\br-1loqt21\b/.test(el.className || '') && el.offsetParent !== null;
    });
  }

  function readQuiz() {
    if (!isQuizScreen()) return null;
    var ps = pressables();
    var nextBtn = null;
    var choices = [];
    ps.forEach(function (el) {
      var t = (el.innerText || '').trim();
      if (!t) return;
      if (t === 'Next' || t === 'See score') nextBtn = el;
      else if (/Length|full question|Home|Dev settings|Tap to start voice/i.test(t)) return;
      else if (t.length > 1) choices.push({ el: el, text: t.split('\n')[0] });
    });
    var lines = pageText().split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    var qi = lines.findIndex(function (l) { return l === 'Click to view full question' || l === 'Hide full question'; });
    var question = qi > 0 ? lines[qi - 1] : '';
    var revealed = lines.some(function (l) {
      return l.indexOf('Yes \u2014 correct') !== -1 || l.indexOf('Yes - correct') !== -1 || l.indexOf('No \u2014 not this time') !== -1 || l.indexOf('No - not this time') !== -1;
    });
    var ans = lines.find(function (l) { return l.indexOf('Answer: ') === 0; });
    var yes = lines.some(function (l) { return l.indexOf('Yes') === 0 && l.toLowerCase().indexOf('correct') !== -1; });
    return { question: question, choices: choices.slice(0, 4), nextBtn: nextBtn, revealed: revealed, correct: yes, answer: ans ? ans.slice(8) : '' };
  }

  async function sayChoices(q) {
    for (var i = 0; i < q.choices.length; i++) {
      await speak('Option ' + (i + 1) + '. ' + q.choices[i].text);
    }
    await speak('Say 5 to hear the options again.');
  }

  async function runLoop(fromTap) {
    if (running) return;
    if (!fromTap && !unlocked) {
      setBanner('Tap the purple button to turn the sound on.');
      showStart(true);
      return;
    }
    running = true;
    stopFlag = false;
    lastQuestion = '';
    showStart(false);
    await lockScreen();
    setBanner('Voice play on. Keep this page open.');
    while (!stopFlag && isQuizScreen()) {
      var q = null;
      for (var i = 0; i < 40; i++) {
        q = readQuiz();
        if (q && q.question && q.choices.length >= 2 && q.question !== lastQuestion && !q.revealed) break;
        await wait(120);
      }
      if (!q || !q.question || q.choices.length < 2) break;
      lastQuestion = q.question;
      setBanner('Reading question');
      await speak('Question. ' + q.question);
      if (stopFlag) break;
      setBanner('Reading answers');
      await sayChoices(q);
      if (stopFlag) break;
      var heard = { n: 0, heard: '' };
      for (var tries = 0; tries < 6 && !stopFlag && !heard.n; tries++) {
        setBanner('Listening now \u2014 say 1, 2, 3, 4 or 5');
        heard = await listenOnce(q.choices);
        if (heard.n === 5) {
          await sayChoices(q);
          heard = { n: 0, heard: '' };
        } else if (!heard.n) {
          setBanner(heard.heard ? ('Heard: ' + heard.heard + ' \u2014 please say a number') : 'Did not catch a number. Say 1, 2, 3 or 4.');
          await speak('Please say one, two, three, four, or five.');
        }
      }
      if (stopFlag) break;
      if (heard.n >= 1 && heard.n <= 4) {
        var choice = q.choices[heard.n - 1];
        setBanner('Picking option ' + heard.n);
        if (choice) tap(choice.el);
        await wait(650);
        var res = readQuiz() || q;
        if (res.correct) { setBanner('Correct'); await speak('Yes. That is right.'); }
        else { setBanner('Not this time'); await speak('Not this time. The right answer was. ' + (res.answer || '')); }
        await wait(800);
        var after = readQuiz();
        if (after && after.nextBtn) {
          var label = (after.nextBtn.innerText || '').trim();
          tap(after.nextBtn);
          if (label === 'See score') { await speak('That is the end of this set.'); break; }
        } else { await speak('That is the end of this set.'); break; }
        await wait(350);
      } else {
        setBanner('Voice paused. Tap an answer, or tap the purple button again.');
        showStart(true);
        break;
      }
    }
    running = false;
    try { if (wake && wake.release) wake.release(); } catch (e) {}
    wake = null;
    if (isQuizScreen()) showStart(true);
  }

  function stop() {
    stopFlag = true;
    running = false;
    try { if (synth) synth.cancel(); } catch (e) {}
    try { if (rec) rec.stop(); } catch (e) {}
    try { if (wake && wake.release) wake.release(); } catch (e) {}
    wake = null;
    setBanner(null);
    showStart(false);
  }

  function maybeUi() {
    ensureUi();
    if (isPickScreen() || isQuizScreen()) {
      if (!running) {
        showStart(true);
        if (!unlocked) setBanner('Phone sound is off until you tap the purple button.');
      }
    } else {
      showStart(false);
      if (!isMumPage()) { setBanner(null); if (running) stop(); }
    }
  }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && running) lockScreen();
  });

  setInterval(maybeUi, 700);
  window.__lhMumVoice = { start: function () { runLoop(true); }, stop: stop };
})();
