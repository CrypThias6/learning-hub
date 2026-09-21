/* Hands-free voice for Mum's counselling quiz only. */
(function () {
  var synth = window.speechSynthesis || null;
  var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  var stopFlag = false;
  var running = false;
  var rec = null;
  var wake = null;
  var banner = null;
  var lastQuestion = '';
  var armed = false;
  var audioReady = false;
  var voicesReady = false;

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

  function setBanner(text) {
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'lh-voice-banner';
      banner.style.cssText = 'position:fixed;left:10px;right:10px;bottom:62px;z-index:2147483000;background:#152238;color:#d6e4f5;border:1px solid #C77DFF;border-radius:14px;padding:10px 12px;font:600 14px system-ui,sans-serif;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.35);display:none';
      banner.addEventListener('click', function () {
        try { window.__lhMumVoice && window.__lhMumVoice.prime && window.__lhMumVoice.prime(); } catch (e) {}
        try {
          var u = new SpeechSynthesisUtterance('Sound is on. After the answers, say one, two, three or four.');
          u.lang = 'en-AU';
          u.volume = 1;
          speechSynthesis.cancel();
          speechSynthesis.resume();
          speechSynthesis.speak(u);
        } catch (e) {}
      });
      document.body.appendChild(banner);
    }
    if (!text) {
      banner.style.display = 'none';
      banner.textContent = '';
      return;
    }
    banner.style.display = 'block';
    banner.textContent = text;
  }

  function loadVoices() {
    if (!synth) return [];
    var list = synth.getVoices() || [];
    if (list.length) voicesReady = true;
    return list;
  }

  if (synth) {
    loadVoices();
    try { synth.addEventListener('voiceschanged', loadVoices); } catch (e) {}
    setInterval(function () {
      try { if (synth.paused) synth.resume(); } catch (e) {}
    }, 800);
  }

  function pickVoice() {
    var list = loadVoices();
    return list.find(function (v) {
      return /en-NZ|en_NZ|New Zealand/i.test(v.lang + ' ' + v.name);
    }) || list.find(function (v) {
      return /en-AU|en_AU|Australian/i.test(v.lang + ' ' + v.name);
    }) || list.find(function (v) {
      return /en-GB|en_GB|English United Kingdom|UK/i.test(v.lang + ' ' + v.name);
    }) || list.find(function (v) {
      return /en-US|en_US|^en/i.test(v.lang);
    }) || list[0] || null;
  }

  function primeAudio() {
    if (!synth) return;
    audioReady = true;
    try { synth.resume(); } catch (e) {}
    try {
      var warm = new SpeechSynthesisUtterance(' ');
      warm.volume = 1;
      warm.rate = 1;
      warm.lang = 'en-AU';
      synth.speak(warm);
    } catch (e) {}
  }

  function speak(text) {
    return new Promise(function (resolve) {
      if (stopFlag) return resolve();
      if (!synth || !text) return resolve();
      var said = String(text).replace(/\s+/g, ' ').trim();
      if (!said) return resolve();
      try { synth.cancel(); } catch (e) {}
      try { synth.resume(); } catch (e) {}
      var u = new SpeechSynthesisUtterance(said);
      var v = pickVoice();
      if (v) {
        u.voice = v;
        u.lang = v.lang || 'en-AU';
      } else {
        u.lang = 'en-AU';
      }
      u.rate = 0.92;
      u.pitch = 1;
      u.volume = 1;
      var done = false;
      var started = false;
      function finish() {
        if (done) return;
        done = true;
        resolve();
      }
      u.onstart = function () { started = true; audioReady = true; };
      u.onend = finish;
      u.onerror = finish;
      try { synth.speak(u); } catch (e) { finish(); return; }
      setTimeout(function () {
        if (!started) {
          try { synth.cancel(); } catch (e) {}
          try {
            var u2 = new SpeechSynthesisUtterance(said);
            u2.lang = 'en';
            u2.volume = 1;
            u2.rate = 0.92;
            u2.onend = finish;
            u2.onerror = finish;
            synth.speak(u2);
          } catch (e) { finish(); }
        }
      }, 1200);
      setTimeout(finish, Math.min(28000, 1600 + said.length * 70));
    });
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
      var best = 0;
      var bestScore = 0;
      choices.forEach(function (c, i) {
        var ct = String(c.text || '').toLowerCase().replace(/[^\w\s]/g, ' ');
        var words = raw.split(' ').filter(function (w) { return w.length > 3; });
        var hit = 0;
        words.forEach(function (w) { if (ct.indexOf(w) !== -1) hit += 1; });
        if (hit > bestScore && hit >= 2) {
          bestScore = hit;
          best = i + 1;
        }
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
      rec.lang = 'en-AU';
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
        said.forEach(function (s) {
          if (!n) n = parseChoice(s, choices);
        });
        if (lastHeard) setBanner('Heard: ' + lastHeard + (n ? '  \u2192  ' + n : '  \u2014  say 1, 2, 3, 4 or 5'));
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
      if (navigator.wakeLock && navigator.wakeLock.request) {
        wake = await navigator.wakeLock.request('screen');
      }
    } catch (e) {}
  }

  function tap(el) {
    if (!el) return;
    try { el.scrollIntoView({ block: 'center', inline: 'nearest' }); } catch (e) {}
    var x = 0;
    var y = 0;
    try {
      var r = el.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height / 2;
    } catch (e) {}
    var opts = { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, pointerType: 'touch', buttons: 1 };
    ['pointerover', 'pointerenter', 'pointerdown', 'touchstart', 'mousedown', 'pointerup', 'touchend', 'mouseup', 'click'].forEach(function (type) {
      try {
        if (type.indexOf('touch') === 0) {
          var te = new Event(type, { bubbles: true, cancelable: true });
          el.dispatchEvent(te);
        } else if (type.indexOf('pointer') === 0 && window.PointerEvent) {
          el.dispatchEvent(new PointerEvent(type, opts));
        } else {
          el.dispatchEvent(new MouseEvent(type, opts));
        }
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
      else if (/Length|full question|Home|Dev settings/i.test(t)) return;
      else if (t.length > 1) choices.push({ el: el, text: t.split('\n')[0] });
    });
    var lines = pageText().split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    var qi = lines.findIndex(function (l) { return l === 'Click to view full question' || l === 'Hide full question'; });
    var question = qi > 0 ? lines[qi - 1] : '';
    var revealed = lines.some(function (l) {
      return l.indexOf('Yes \u2014 correct') !== -1 || l.indexOf('Yes - correct') !== -1 || l.indexOf('No \u2014 not this time') !== -1 || l.indexOf('No - not this time') !== -1;
    });
    var correctLine = '';
    var ans = lines.find(function (l) { return l.indexOf('Answer: ') === 0; });
    if (ans) correctLine = ans.slice(8);
    var yes = lines.some(function (l) { return l.indexOf('Yes') === 0 && l.toLowerCase().indexOf('correct') !== -1; });
    return {
      question: question,
      choices: choices.slice(0, 4),
      nextBtn: nextBtn,
      revealed: revealed,
      correct: yes,
      answer: correctLine
    };
  }

  async function sayChoices(q) {
    var parts = [];
    q.choices.forEach(function (c, i) {
      parts.push('Option ' + (i + 1) + '. ' + c.text);
    });
    parts.push('Say 5 to hear the options again.');
    return speak(parts.join(' '));
  }

  async function runLoop() {
    if (running) return;
    running = true;
    stopFlag = false;
    lastQuestion = '';
    await lockScreen();
    primeAudio();
    await wait(180);
    setBanner('Voice play on. Keep this page open.');
    await speak('Voice play is on. I will read each question. After I finish, say 1, 2, 3 or 4. Say 5 to hear the options again.');
    if (!Rec) {
      setBanner('This browser can read, but cannot listen. Tap an answer.');
      await speak('This browser cannot listen. Tap an answer on the screen.');
    }
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
        setBanner('Listening now \u2014 say 1, 2, 3, 4, or 5');
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
        if (res.correct) {
          setBanner('Correct');
          await speak('Yes. That is right.');
        } else {
          setBanner('Not this time');
          await speak('Not this time. The right answer was. ' + (res.answer || ''));
        }
        await wait(900);
        var after = readQuiz();
        if (after && after.nextBtn) {
          var label = (after.nextBtn.innerText || '').trim();
          tap(after.nextBtn);
          if (label === 'See score') {
            await speak('That is the end of this set.');
            break;
          }
        } else {
          await speak('That is the end of this set.');
          break;
        }
        await wait(350);
      } else {
        setBanner('Voice paused. Tap an answer, or start the quiz again.');
        await speak('Tap an answer on the screen if voice did not catch it.');
        break;
      }
    }
    running = false;
    try { if (wake && wake.release) wake.release(); } catch (e) {}
    wake = null;
  }

  function stop() {
    stopFlag = true;
    running = false;
    try { if (synth) synth.cancel(); } catch (e) {}
    try { if (rec) rec.stop(); } catch (e) {}
    try { if (wake && wake.release) wake.release(); } catch (e) {}
    wake = null;
    setBanner(null);
  }

  function maybeStart() {
    if (stopFlag && isPickScreen()) stopFlag = false;
    if (isQuizScreen() && !running && !stopFlag) runLoop();
    if (!isMumPage() && running) stop();
  }

  document.addEventListener('pointerdown', function () {
    primeAudio();
  }, true);
  document.addEventListener('click', function () {
    primeAudio();
  }, true);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      primeAudio();
      if (running) lockScreen();
    }
  });

  setInterval(maybeStart, 600);
  window.__lhMumVoice = { start: runLoop, stop: stop, prime: primeAudio };
})();
