(function () {
    var KEY = '@family/xaiKey';
    var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    var state = { screen: 'home' };
    var rec = null;

    var TOPICS = [
      { a: 'Phones stay off the table at dinner', b: 'Phones can stay out if they are on silent' },
      { a: 'Homework should be finished before screens', b: 'A short break after school first is fair' },
      { a: 'Chores should be on a set roster', b: 'Chores should be done when someone notices they are needed' },
      { a: 'Bedtimes should stay the same on weekends', b: 'Weekend bedtimes can be a bit later' },
      { a: 'Family movie night should be a vote', b: 'Whoever organised it should pick the film' },
      { a: 'Pets are a shared job', b: 'The person who asked for the pet does more of the work' },
      { a: 'Pocket money is earned with jobs', b: 'A small set amount each week is simpler' },
      { a: 'One shared family tablet is enough', b: 'Each person should have their own device' }
    ];

    var SCENES = [
      'Someone left dishes in the sink again.',
      'Two people want the same seat in the car.',
      'Screen time ran over and someone is annoyed.',
      'A shared charger keeps going missing.',
      'Plans changed at the last minute.',
      'Someone used the last of the milk and did not say.',
      'Music is too loud for one person and too quiet for the other.',
      'A promise to help with a job was forgotten.'
    ];

    var LEVELS = [
      { n:1, name:'Agreeable', blurb:'Listens and accepts good points.' },
      { n:2, name:'Cooperative', blurb:'Has a view, will rethink it.' },
      { n:3, name:'Skeptical', blurb:'Needs some convincing.' },
      { n:4, name:'Stubborn', blurb:'Holds the line but hears logic.' },
      { n:5, name:'Defensive', blurb:'Takes it a bit personally.' },
      { n:6, name:'Emotional', blurb:'Gets frustrated and skips bits.' },
      { n:7, name:'Unreasonable', blurb:'Moves the goalposts.' },
      { n:8, name:'Highly defensive', blurb:'Hears attack where there is none.' },
      { n:9, name:'Chaotic', blurb:'Hard to pin down.' },
      { n:10, name:'Extremely unreasonable', blurb:'Almost will not concede.' }
    ];

    function key() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
    function hasKey() { return !!key(); }
    function el(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
    function esc(s) { return String(s||'').replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]); }); }
    function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

    function render() {
      var root = document.getElementById('app');
      root.innerHTML = '';
      var s = state.screen;
      if (s === 'home') viewHome(root);
      else if (s === 'face-setup') viewFaceSetup(root);
      else if (s === 'face-live') viewFaceLive(root);
      else if (s === 'face-result') viewFaceResult(root);
      else if (s === 'arg-setup') viewArgSetup(root);
      else if (s === 'arg-live') viewArgLive(root);
      else if (s === 'arg-result') viewArgResult(root);
    }

    function viewHome(root) {
      root.appendChild(el('<h1>Debate</h1>'));
      root.appendChild(el('<p class="lead">Put the phone between two people, or practise calming a tough chat.</p>'));
      var a = el('<button class="choice" type="button"><h3>Face to face</h3><p>Two topics. Pick a side. Timed turns. Grok picks a winner from what was said.</p></button>');
      var b = el('<button class="choice" type="button"><h3>Argument practice</h3><p>Talk with an AI on a level from 1 to 10. Winning is calming things down, not forcing a mind-change.</p></button>');
      a.onclick = function(){ startFace(); };
      b.onclick = function(){ state = { screen:'arg-setup', level:3, scene: pick(SCENES) }; render(); };
      root.appendChild(a);
      var gap = document.createElement('div'); gap.style.height = '10px'; root.appendChild(gap);
      root.appendChild(b);
      if (!hasKey()) root.appendChild(el('<p class="warn">Add a Grok key in Projects → Settings before judging or the argument bot can run.</p>'));
    }

    function startFace() {
      var pair = pick(TOPICS);
      state = { screen:'face-setup', pair:pair, p1:'', p2:'', first: Math.random()<0.5?'p1':'p2', turnSec:45, totalSec:240, used:0, turns:[], draft:'' };
      render();
    }

    function viewFaceSetup(root) {
      root.appendChild(el('<h1>Face to face</h1>'));
      root.appendChild(el('<p class="lead">Read both sides. Each person picks one. Then put the phone in the middle.</p>'));
      var c1 = el('<button class="choice'+(state.p1==='a'||state.p2==='a'?' on':'')+'" type="button"><h3>Side A</h3><p>'+esc(state.pair.a)+'</p></button>');
      var c2 = el('<button class="choice'+(state.p1==='b'||state.p2==='b'?' on':'')+'" type="button"><h3>Side B</h3><p>'+esc(state.pair.b)+'</p></button>');
      root.appendChild(c1); var g=document.createElement('div'); g.style.height='8px'; root.appendChild(g); root.appendChild(c2);
      root.appendChild(el('<p class="muted">Player 1: '+(state.p1? (state.p1==='a'?'Side A':'Side B') : 'not picked')+' · Player 2: '+(state.p2? (state.p2==='a'?'Side A':'Side B') : 'not picked')+'</p>'));
      c1.onclick = function(){ claim('a'); };
      c2.onclick = function(){ claim('b'); };
      var go = el('<button class="btn go" type="button">Start debate</button>');
      go.onclick = function(){ if (!state.p1 || !state.p2) return; state.screen='face-live'; state.speaker=state.first; state.left=state.turnSec; state.running=false; render(); };
      root.appendChild(go);
      var np = el('<button class="btn ghost" type="button">New topics</button>');
      np.onclick = startFace; root.appendChild(np);
    }

    function claim(side) {
      if (state.p1 === side) { state.p1=''; render(); return; }
      if (state.p2 === side) { state.p2=''; render(); return; }
      if (!state.p1) state.p1 = side;
      else if (!state.p2 && state.p1 !== side) state.p2 = side;
      render();
    }
    function sideText(who) { var side = who==='p1'?state.p1:state.p2; return side==='a'?state.pair.a:state.pair.b; }

    function viewFaceLive(root) {
      var name = state.speaker==='p1'?'Player 1':'Player 2';
      root.appendChild(el('<p class="who">'+name+'</p>'));
      root.appendChild(el('<p class="lead" style="text-align:center">'+esc(sideText(state.speaker))+'</p>'));
      root.appendChild(el('<div class="timer" id="clock">'+state.left+'</div>'));
      root.appendChild(el('<p class="muted" style="text-align:center">Match left '+Math.max(0,state.totalSec-state.used)+'s</p>'));
      root.appendChild(el('<div class="log" id="draft">'+(esc(state.draft)||'Listening will appear here. You can edit it.')+'</div>'));
      if (!state.running) { var go=el('<button class="btn go" type="button">Go</button>'); go.onclick=beginTurn; root.appendChild(go); }
      else { var stop=el('<button class="btn hot" type="button">Stop turn</button>'); stop.onclick=endTurn; root.appendChild(stop); }
      var typed=el('<button class="btn ghost" type="button">Type instead</button>');
      typed.onclick=function(){ var t=prompt('What did they say?', state.draft||''); if(t!=null){ state.draft=t; render(); } };
      root.appendChild(typed);
    }

    function beginTurn() { state.running=true; state.draft=''; startListen(function(text){ state.draft=text; var d=document.getElementById('draft'); if(d) d.textContent=text||'Listening...'; }); tickTurn(); render(); }
    function tickTurn() {
      clearInterval(state.tick);
      state.tick=setInterval(function(){ if(!state.running) return; state.left-=1; state.used+=1; var c=document.getElementById('clock'); if(c) c.textContent=String(Math.max(0,state.left)); if(state.left<=0||state.used>=state.totalSec) endTurn(); },1000);
    }
    async function endTurn() {
      if (!state.running && state.screen!=='face-live') return;
      state.running=false; clearInterval(state.tick); stopListen();
      var raw=state.draft||''; var clean=raw;
      try { if(raw && hasKey()) clean=await cleanTalk(raw); } catch(e) {}
      state.turns.push({ who:state.speaker, side:sideText(state.speaker), raw:raw, text:clean });
      if (state.used>=state.totalSec) { await judgeFace(); return; }
      state.speaker = state.speaker==='p1'?'p2':'p1'; state.left=state.turnSec; state.draft=''; render();
    }
    async function judgeFace() {
      state.screen='face-result'; state.verdict={loading:true}; render();
      if (!hasKey()) { state.verdict={error:'Add a Grok key in Projects → Settings to judge this debate.'}; render(); return; }
      try {
        var payload=state.turns.map(function(t,i){ return 'Turn '+(i+1)+' · '+(t.who==='p1'?'Player 1':'Player 2')+' arguing: '+t.side+'\n'+t.text; }).join('\n\n');
        var out=await grok([{role:'system',content:'You judge a short family debate. Be fair and brief. Family-safe language only. Return JSON with keys winner (Player 1, Player 2, or Draw), reason (2 sentences), p1Score (0-10), p2Score (0-10).'},{role:'user',content:'Side A: '+state.pair.a+'\nSide B: '+state.pair.b+'\nPlayer 1 chose: '+sideText('p1')+'\nPlayer 2 chose: '+sideText('p2')+'\n\n'+payload}], true);
        state.verdict=JSON.parse(extractJson(out));
      } catch(e) { state.verdict={error:'Could not judge. Check the key and internet.'}; }
      render();
    }
    function viewFaceResult(root) {
      root.appendChild(el('<h1>Result</h1>'));
      var v=state.verdict||{};
      if (v.loading) root.appendChild(el('<p class="lead">Grok is reading both sides...</p>'));
      else if (v.error) root.appendChild(el('<p class="warn">'+esc(v.error)+'</p>'));
      else { root.appendChild(el('<h2>'+esc(v.winner||'Draw')+'</h2>')); root.appendChild(el('<p class="lead">'+esc(v.reason||'')+'</p>')); root.appendChild(el('<p class="muted">Player 1 '+esc(v.p1Score)+' · Player 2 '+esc(v.p2Score)+'</p>')); }
      var again=el('<button class="btn go" type="button">Another debate</button>'); again.onclick=startFace; root.appendChild(again);
      var home=el('<button class="btn ghost" type="button">Debate home</button>'); home.onclick=function(){ state={screen:'home'}; render(); }; root.appendChild(home);
    }

    function viewArgSetup(root) {
      root.appendChild(el('<h1>Argument practice</h1>'));
      root.appendChild(el('<p class="lead">Pick how hard the other person is. Then talk. Winning is not that they gave up.</p>'));
      var grid=el('<div class="levels"></div>');
      LEVELS.forEach(function(lv){ var b=el('<button type="button" class="'+(state.level===lv.n?'on':'')+'">'+lv.n+'. '+lv.name+'</button>'); b.onclick=function(){ state.level=lv.n; render(); }; grid.appendChild(b); });
      root.appendChild(grid);
      root.appendChild(el('<p class="muted">'+esc(LEVELS[state.level-1].blurb)+'</p>'));
      root.appendChild(el('<div class="card"><h3>Situation</h3><p>'+esc(state.scene)+'</p></div>'));
      var shuffle=el('<button class="btn ghost" type="button">New situation</button>'); shuffle.onclick=function(){ state.scene=pick(SCENES); render(); }; root.appendChild(shuffle);
      var go=el('<button class="btn alt" type="button">Start</button>');
      go.onclick=function(){ if(!hasKey()){ alert('Add a Grok key in Projects → Settings first.'); return;} state.screen='arg-live'; state.msgs=[]; state.input=''; render(); botOpen(); };
      root.appendChild(go);
    }
    function viewArgLive(root) {
      var lv=LEVELS[state.level-1];
      root.appendChild(el('<h1>Level '+lv.n+' · '+lv.name+'</h1>'));
      root.appendChild(el('<p class="lead">'+esc(state.scene)+'</p>'));
      var chat=el('<div class="chat"></div>');
      (state.msgs||[]).forEach(function(m){ chat.appendChild(el('<div class="bubble '+(m.role==='user'?'me':'bot')+'">'+esc(m.text)+'</div>')); });
      if (state.thinking) chat.appendChild(el('<div class="bubble bot muted">...</div>'));
      root.appendChild(chat);
      var box=el('<textarea id="say" rows="3" placeholder="Type, or tap Listen"></textarea>'); box.value=state.input||''; box.oninput=function(){ state.input=box.value; }; root.appendChild(box);
      var listen=el('<button class="btn ghost" type="button">Listen</button>'); listen.onclick=listenOnceBox; root.appendChild(listen);
      var send=el('<button class="btn go" type="button">Send</button>'); send.onclick=sendArg; root.appendChild(send);
      var end=el('<button class="btn hot" type="button">End and score</button>'); end.onclick=scoreArg; root.appendChild(end);
    }
    function viewArgResult(root) {
      var s=state.score||{};
      root.appendChild(el('<h1>'+(s.win?'That is a win':'Not quite')+'</h1>'));
      root.appendChild(el('<p class="lead">'+esc(s.summary||'')+'</p>'));
      ['deescalation','understanding','reasoning','progress','composure'].forEach(function(k){ var n=Number(s[k]||0); root.appendChild(el('<div class="score"><span>'+k+'</span><strong>'+n+'/3</strong></div>')); var bar=el('<div class="bar"><span></span></div>'); bar.firstChild.style.width=Math.round((n/3)*100)+'%'; root.appendChild(bar); });
      root.appendChild(el('<p class="muted">Target this level: '+esc(s.target||'')+'</p>'));
      var again=el('<button class="btn alt" type="button">Try another</button>'); again.onclick=function(){ state={screen:'arg-setup',level:state.level,scene:pick(SCENES)}; render(); }; root.appendChild(again);
    }
    function levelPrompt(n) {
      var map={1:'Very reasonable. Listen carefully and readily accept good points.',2:'Have a position but stay open-minded. Reconsider when given good reasoning.',3:'Be reasonable but question claims. Need some convincing.',4:'Defend your position strongly, but still respond to logic and evidence.',5:'Take disagreement a bit personally at times and protect your position rather than examining it.',6:'Become noticeably frustrated. Interrupt the point a little. Reply to only some of what they said.',7:'Misinterpret points, move goalposts, and argue more from feeling than logic.',8:'Assume they are attacking you. Dismiss good arguments. Shift the topic when challenged.',9:'Be very emotional, a bit contradictory, hard to pin down, and keep finding new reasons they are wrong.',10:'Almost completely resist reasoning. Read things negatively. Escalate easily. Do not concede even obvious points.'};
      return map[n]||map[3];
    }
    function targetFor(n) {
      if (n<=2) return 'Reach a calm agreement or a clear shared plan.';
      if (n<=4) return 'Get them to acknowledge your main reasoning.';
      if (n<=6) return 'Keep them calmer and get one meaningful concession.';
      if (n<=8) return 'State your view clearly and get them to understand at least one part of it.';
      return 'De-escalate, show you understand them, and reach a workable next step even if you still disagree.';
    }
    function argSystem() {
      return ['You are the other person in a family argument practice game.','Keep language suitable for a family, including children. No insults, slurs, threats, or adult topics.','Situation: '+state.scene,'Behaviour level '+state.level+': '+levelPrompt(state.level),'Stay in character. Short replies, 2 to 5 sentences.','Never break character to give scoring tips.','Do not claim you changed your deepest view unless the user earned it for this level.'].join(' ');
    }
    async function botOpen() {
      state.thinking=true; render();
      try { var text=await grok([{role:'system',content:argSystem()},{role:'user',content:'Start the conversation from your side of the situation. Do not greet like a helper. Just speak as the upset or opposing person.'}], false); state.msgs.push({role:'bot',text:text}); }
      catch(e){ state.msgs.push({role:'bot',text:'I cannot talk until a Grok key is saved in Settings.'}); }
      state.thinking=false; render();
    }
    async function sendArg() {
      var said=String(state.input||'').trim(); if(!said) return;
      state.msgs.push({role:'user',text:said}); state.input=''; state.thinking=true; render();
      try { var messages=[{role:'system',content:argSystem()}]; state.msgs.forEach(function(m){ messages.push({role:m.role==='user'?'user':'assistant',content:m.text}); }); var text=await grok(messages,false); state.msgs.push({role:'bot',text:text}); }
      catch(e){ state.msgs.push({role:'bot',text:'The reply failed. Check the key and try again.'}); }
      state.thinking=false; render();
    }
    async function scoreArg() {
      state.screen='arg-result'; state.score={summary:'Scoring...'}; render();
      try {
        var convo=(state.msgs||[]).map(function(m){ return (m.role==='user'?'You: ':'Them: ')+m.text; }).join('\n');
        var out=await grok([{role:'system',content:'Score a family argument-practice chat. Do not treat they changed their mind as required. Return JSON keys: deescalation, understanding, reasoning, progress, composure (each 0-3 integers), win (boolean), summary (2 sentences), target (one sentence). Winning means the player met the target for this level, not that the other person fully converted.'},{role:'user',content:'Level '+state.level+'. Target: '+targetFor(state.level)+'\nSituation: '+state.scene+'\n\n'+convo}], true);
        var parsed=JSON.parse(extractJson(out)); parsed.target=parsed.target||targetFor(state.level); state.score=parsed;
      } catch(e) { state.score={summary:'Could not score. Check the Grok key.',deescalation:0,understanding:0,reasoning:0,progress:0,composure:0,win:false,target:targetFor(state.level)}; }
      render();
    }
    function extractJson(s){ var t=String(s||'').trim(); var a=t.indexOf('{'), b=t.lastIndexOf('}'); return (a>=0&&b>a)?t.slice(a,b+1):t; }
    async function grok(messages, jsonMode) {
      var k=key(); if(!k) throw new Error('NO_KEY');
      var models=['grok-3','grok-4-fast-non-reasoning','grok-2-latest']; var lastErr=null;
      for (var i=0;i<models.length;i++) {
        try {
          var body={model:models[i],messages:messages,temperature:0.7}; if(jsonMode) body.response_format={type:'json_object'};
          var res=await fetch('https://api.x.ai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+k},body:JSON.stringify(body)});
          if(!res.ok){ lastErr=new Error('HTTP '+res.status); continue; }
          var data=await res.json(); return (((data.choices||[])[0]||{}).message||{}).content||'';
        } catch(e){ lastErr=e; }
      }
      throw lastErr||new Error('fail');
    }
    async function cleanTalk(raw) {
      var out=await grok([{role:'system',content:'You clean messy speech-to-text from a family debate. Keep the meaning. Do not add new arguments. Return only the cleaned transcript.'},{role:'user',content:raw}], false);
      return String(out||raw).trim()||raw;
    }
    function startListen(ontext) {
      stopListen(); if(!Rec) return; rec=new Rec(); rec.lang='en-NZ'; rec.continuous=true; rec.interimResults=true;
      rec.onresult=function(ev){ var said=''; for(var i=0;i<ev.results.length;i++) said+=ev.results[i][0].transcript+' '; ontext(said.trim()); };
      try{ rec.start(); }catch(e){}
    }
    function stopListen(){ try{ if(rec) rec.stop(); }catch(e){} rec=null; }
    function listenOnceBox() {
      if(!Rec){ alert('This browser cannot listen. Type instead.'); return; }
      stopListen(); rec=new Rec(); rec.lang='en-NZ'; rec.interimResults=true;
      rec.onresult=function(ev){ var said=ev.results[0][0].transcript||''; state.input=said; var box=document.getElementById('say'); if(box) box.value=said; };
      try{ rec.start(); }catch(e){}
    }
    render();
  })();
