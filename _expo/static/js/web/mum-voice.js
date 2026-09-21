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

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function pageText() {
    return (document.body && document.body.innerText) || '';
  }

  function isMumPage() {
    var t = pageText();
    return t.indexOf('Counselling & Guidance') !== -1 || t.indexOf('Counselling \u00b7') !== -1;
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
      banner.style.cssText = 'position:fixed;left:12px;right:12px;bottom:64px;z-index:2147483000;background:#152238;color:#d6e4f5;border:1px solid #C77DFF;border-radius:14px;padding:10px 14px;font:600 14px system-ui,sans-serif;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.35);display:none';
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

  function pickVoice() {
    if (!synth) return null;
    var list = synth.getVoices() || [];
    return list.find(function (v) {
      return /en-NZ|en_NZ|New Zealand/i.test(v.lang + ' ' + v.name);
    }) || list.find(function (v) {
      return /en-AU|en_AU|en-GB|en_GB|en-US|en_US/i.test(v.lang);
    }) || list[0] || null;
  }

  function speak(text) {
    return new Promise(function (resolve) {
      if (stopFlag) return resolve();
      if (!synth || !text) return resolve();
      try { synth.cancel(); } catch (e) {}
      var u = new SpeechSynthesisUtterance(String(text));
      var v = pickVoice();
      if (v) u.voice = v;
      u.rate = 0.95;
      u.pitch = 1;
      u.lang = (v && v.lang) || 'en-NZ';
      var done = false;
      function finish() {
        if (done) return;
        done = true;
        resolve();
      }
      u.onend = finish;
      u.onerror = finish;
      try { synth.speak(u); } catch (e) { finish(); }
      setTimeout(finish, Math.min(22000, 900 + String(text).length * 85));
    });
  }

  function parseChoice(text) {
    var t = String(text || '').toLowerCase();
    if (/\b(5|five|repeat|again|replay|options|answers)\b/.test(t)) return 5;
    if (/\b(1|one|won|first)\b/.test(t)) return 1;
    if (/\b(2|two|to|too|second)\b/.test(t)) return 2;
    if (/\b(3|three|tree|third)\b/.test(t)) return 3;
    if (/\b(4|four|for|fore|fourth)\b/.test(t)) return 4;
    return 0;
  }

  function listenOnce() {
    return new Promise(function (resolve) {
      if (stopFlag) return resolve(0);
      if (!Rec) return resolve(0);
      try { if (rec) rec.stop(); } catch (e) {}
      rec = new Rec();
      rec.lang = 'en-NZ';
      rec.interimResults = false;
      rec.maxAlternatives = 3;
      rec.continuous = false;
      var done = false;
      function finish(n) {
        if (done) return;
        done = true;
        try { rec.stop(); } catch (e) {}
        resolve(n);
      }
      rec.onresult = function (ev) {
        var said = '';
        try { said = ev.results[0][0].transcript || ''; } catch (e) {}
        finish(parseChoice(said));
      };
      rec.onerror = function () { finish(0); };
      rec.onend = function () { if (!done) finish(0); };
      try { rec.start(); } catch (e) { finish(0); }
      setTimeout(function () { finish(0); }, 8000);
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
    ['pointerdown', 'mousedown', 'mouseup', 'pointerup', 'click'].forEach(function (type) {
      try { el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window })); } catch (e) {}
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
    setBanner('Voice play on. Keep this page open.');
    await speak('Voice play is on. Keep this page open. I will read each question. Say 1 to 4. Say 5 to hear the options again.');
    if (!Rec) {
      await speak('This browser cannot listen. You can still tap an answer on the screen.');
      setBanner('This browser can read the question, but cannot listen. Tap an answer.');
    }
    while (!stopFlag && isQuizScreen()) {
      var q = null;
      for (var i = 0; i < 30; i++) {
        q = readQuiz();
        if (q && q.question && q.choices.length >= 2 && q.question !== lastQuestion && !q.revealed) break;
        await wait(150);
      }
      if (!q || !q.question || q.choices.length < 2) break;
      lastQuestion = q.question;
      setBanner('Reading question');
      await speak('Question. ' + q.question);
      if (stopFlag) break;
      await sayChoices(q);
      if (stopFlag) break;
      var heard = 0;
      for (var tries = 0; tries < 6 && !stopFlag && !heard; tries++) {
        setBanner('Listening... say 1, 2, 3, 4, or 5 to repeat');
        await speak('Your answer?');
        heard = await listenOnce();
        if (heard === 5) {
          await sayChoices(q);
          heard = 0;
        } else if (!heard) {
          await speak('I did not catch a number. Please say 1, 2, 3, 4, or 5.');
        }
      }
      if (stopFlag) break;
      if (heard >= 1 && heard <= 4) {
        var choice = q.choices[heard - 1];
        if (choice) tap(choice.el);
        await wait(500);
        var res = readQuiz() || q;
        if (res.correct) {
          setBanner('Correct');
          await speak('Yes. That is right.');
        } else {
          setBanner('Not this time');
          await speak('Not this time. The right answer was. ' + (res.answer || ''));
        }
        await wait(1100);
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
        await wait(400);
      } else {
        setBanner('Voice paused. Tap an answer or start again.');
        await speak('We will move on when you tap an answer on the screen.');
        break;
      }
    }
    running = false;
    setBanner(null);
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

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && running) lockScreen();
  });

  setInterval(maybeStart, 700);
  window.__lhMumVoice = { start: runLoop, stop: stop };
})();
