
(function() {
  let audioCtx = null;
  let activeNotes = new Map();
  let currentInstrument = "harmonium";
  let masterVolume = 0.75;
  let pressedKeys = new Set();

  const notes = {
    'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
    'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
    'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
  };

  const noteList = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const keyMap = {
    'a': 'C', 'w': 'C#', 's': 'D', 'e': 'D#', 'd': 'E',
    'f': 'F', 't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A',
    'u': 'A#', 'j': 'B'
  };

  const sargam = {
    'sa': 'C', 're': 'D', 'ga': 'E', 'ma': 'F',
    'pa': 'G', 'dha': 'A', 'ni': 'B'
  };

  const numbers = {'1': 'C', '2': 'D', '3': 'E', '4': 'F', '5': 'G', '6': 'A', '7': 'B'};
  const letters = {'c': 'C', 'd': 'D', 'e': 'E', 'f': 'F', 'g': 'G', 'a': 'A', 'b': 'B'};

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playHarmonium(freq, vol, now, noteId) {
    const ctx = audioCtx;
    const masterGain = ctx.createGain();
    masterGain.gain.value = vol * 0.7;
    masterGain.connect(ctx.destination);
    
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.value = freq;
    
    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.value = freq * 1.005;
    
    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.value = freq * 2.01;
    
    const filter1 = ctx.createBiquadFilter();
    filter1.type = 'bandpass';
    filter1.frequency.value = freq * 2.2;
    filter1.Q.value = 6;
    
    const filter2 = ctx.createBiquadFilter();
    filter2.type = 'lowpass';
    filter2.frequency.value = freq * 3;
    filter2.Q.value = 3;
    
    const gain1 = ctx.createGain();
    gain1.gain.value = 0.5;
    const gain2 = ctx.createGain();
    gain2.gain.value = 0.35;
    const gain3 = ctx.createGain();
    gain3.gain.value = 0.2;
    
    osc1.connect(filter1);
    osc2.connect(filter1);
    osc3.connect(filter2);
    filter1.connect(gain1);
    filter2.connect(gain2);
    gain1.connect(masterGain);
    gain2.connect(masterGain);
    gain3.connect(masterGain);
    
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.exponentialRampToValueAtTime(vol * 0.7, now + 0.05);
    masterGain.gain.exponentialRampToValueAtTime(vol * 0.4, now + 0.3);
    masterGain.gain.exponentialRampToValueAtTime(vol * 0.2, now + 1.0);
    
    osc1.start();
    osc2.start();
    osc3.start();
    
    const stopTime = now + 1.5;
    masterGain.gain.exponentialRampToValueAtTime(0.0001, stopTime);
    
    setTimeout(() => {
      try {
        osc1.stop(stopTime + 0.1);
        osc2.stop(stopTime + 0.1);
        osc3.stop(stopTime + 0.1);
        masterGain.disconnect();
      } catch(e) {}
    }, 1600);
    
    return { noteId, stop: () => {} };
  }

  function playPiano(freq, vol, now, noteId) {
    const ctx = audioCtx;
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.value = freq;
    
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 2;
    
    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.value = freq * 4;
    
    const gain1 = ctx.createGain();
    gain1.gain.value = 0.7;
    const gain2 = ctx.createGain();
    gain2.gain.value = 0.3;
    const gain3 = ctx.createGain();
    gain3.gain.value = 0.15;
    
    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);
    gain1.connect(masterGain);
    gain2.connect(masterGain);
    gain3.connect(masterGain);
    
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.exponentialRampToValueAtTime(vol * 0.8, now + 0.01);
    masterGain.gain.exponentialRampToValueAtTime(vol * 0.4, now + 0.15);
    masterGain.gain.exponentialRampToValueAtTime(vol * 0.2, now + 0.5);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
    
    osc1.start();
    osc2.start();
    osc3.start();
    
    setTimeout(() => {
      try {
        osc1.stop(now + 1.9);
        osc2.stop(now + 1.9);
        osc3.stop(now + 1.9);
      } catch(e) {}
    }, 2000);
    
    return { noteId, stop: () => {} };
  }

  function playOrgan(freq, vol, now, noteId) {
    const ctx = audioCtx;
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.value = freq;
    
    const osc2 = ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.value = freq * 1.01;
    
    const osc3 = ctx.createOscillator();
    osc3.type = 'triangle';
    osc3.frequency.value = freq * 2;
    
    const gain1 = ctx.createGain();
    gain1.gain.value = 0.5;
    const gain2 = ctx.createGain();
    gain2.gain.value = 0.35;
    const gain3 = ctx.createGain();
    gain3.gain.value = 0.25;
    
    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);
    gain1.connect(masterGain);
    gain2.connect(masterGain);
    gain3.connect(masterGain);
    
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.exponentialRampToValueAtTime(vol * 0.65, now + 0.08);
    masterGain.gain.setValueAtTime(vol * 0.65, now + 0.5);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
    
    osc1.start();
    osc2.start();
    osc3.start();
    
    setTimeout(() => {
      try {
        osc1.stop(now + 2.3);
        osc2.stop(now + 2.3);
        osc3.stop(now + 2.3);
      } catch(e) {}
    }, 2400);
    
    return { noteId, stop: () => {} };
  }

  function playMarimba(freq, vol, now, noteId) {
    const ctx = audioCtx;
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = freq;
    
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 2.2;
    
    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.value = freq * 3.8;
    
    const gain1 = ctx.createGain();
    gain1.gain.value = 0.8;
    const gain2 = ctx.createGain();
    gain2.gain.value = 0.4;
    const gain3 = ctx.createGain();
    gain3.gain.value = 0.15;
    
    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);
    gain1.connect(masterGain);
    gain2.connect(masterGain);
    gain3.connect(masterGain);
    
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.exponentialRampToValueAtTime(vol * 0.85, now + 0.005);
    masterGain.gain.exponentialRampToValueAtTime(vol * 0.4, now + 0.05);
    masterGain.gain.exponentialRampToValueAtTime(vol * 0.15, now + 0.15);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    
    osc1.start();
    osc2.start();
    osc3.start();
    
    setTimeout(() => {
      try {
        osc1.stop(now + 0.9);
        osc2.stop(now + 0.9);
        osc3.stop(now + 0.9);
      } catch(e) {}
    }, 1000);
    
    return { noteId, stop: () => {} };
  }

  function playNote(noteName, velocity = 0.75) {
    if (!notes[noteName]) return null;
    
    const ctx = initAudio();
    const freq = notes[noteName];
    const now = ctx.currentTime;
    const noteId = `${noteName}_${Date.now()}`;
    const vol = velocity * masterVolume;
    
    let result = null;
    
    switch(currentInstrument) {
      case 'harmonium':
        result = playHarmonium(freq, vol, now, noteId);
        break;
      case 'piano':
        result = playPiano(freq, vol, now, noteId);
        break;
      case 'organ':
        result = playOrgan(freq, vol, now, noteId);
        break;
      case 'marimba':
        result = playMarimba(freq, vol, now, noteId);
        break;
      default:
        result = playHarmonium(freq, vol, now, noteId);
    }
    
    return result;
  }

  function startNote(note) {
    if (!notes[note]) return;
    
  
    for (let [id, data] of activeNotes.entries()) {
      if (id.startsWith(note + '_')) {
        activeNotes.delete(id);
      }
    }
    
    const result = playNote(note, 0.75);
    if (result) {
      activeNotes.set(result.noteId, result);
    }
    
   
    const keyElement = document.querySelector(`.key[data-note="${note}"]`);
    if (keyElement) {
      keyElement.classList.add('key-active');
      setTimeout(() => keyElement.classList.remove('key-active'), 150);
    }
  }

  function stopNote(note) {
    for (let [id, data] of activeNotes.entries()) {
      if (id.startsWith(note + '_')) {
        activeNotes.delete(id);
      }
    }
  }

  
  function onKeyDown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    const key = e.key.toLowerCase();
    
    if (keyMap[key]) {
      e.preventDefault();
      if (!pressedKeys.has(key)) {
        pressedKeys.add(key);
        startNote(keyMap[key]);
        
        const hint = document.getElementById('keyHint');
        hint.innerHTML = `<i class="fas fa-music"></i> ${keyMap[key]} (${key.toUpperCase()})`;
        setTimeout(() => hint.innerHTML = '<i class="fas fa-play"></i> Ready', 600);
      }
    }
  }

  function onKeyUp(e) {
    const key = e.key.toLowerCase();
    if (keyMap[key]) {
      e.preventDefault();
      pressedKeys.delete(key);
      stopNote(keyMap[key]);
    }
  }


  let keywordBuffer = "";
  let keywordTimer = null;

  function onType(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    const key = e.key;
    
    if (key === 'Enter') {
      if (keywordBuffer) processKeyword(keywordBuffer);
      keywordBuffer = "";
      return;
    }
    
    if (key === 'Backspace') {
      keywordBuffer = keywordBuffer.slice(0, -1);
      return;
    }
    
    if (key.length === 1 && /[a-zA-Z0-9#]/.test(key)) {
      keywordBuffer += key;
      
      if (keywordTimer) clearTimeout(keywordTimer);
      keywordTimer = setTimeout(() => {
        if (keywordBuffer) {
          processKeyword(keywordBuffer);
          keywordBuffer = "";
        }
      }, 300);
    }
  }

  function processKeyword(buffer) {
    const lower = buffer.toLowerCase();
    let note = null;
    
    if (sargam[lower]) note = sargam[lower];
    else if (numbers[buffer]) note = numbers[buffer];
    else if (letters[lower]) note = letters[lower];
    else if (lower === 'c#') note = 'C#';
    else if (lower === 'd#') note = 'D#';
    else if (lower === 'f#') note = 'F#';
    else if (lower === 'g#') note = 'G#';
    else if (lower === 'a#') note = 'A#';
    
    if (note && notes[note]) {
      startNote(note);
      setTimeout(() => stopNote(note), 800);
      
      const hint = document.getElementById('keyHint');
      hint.innerHTML = `<i class="fas fa-magic"></i> "${buffer}" → ${note}`;
      setTimeout(() => hint.innerHTML = '<i class="fas fa-play"></i> Ready', 1000);
      
      document.querySelectorAll('.keyword-badge').forEach(b => {
        b.style.transform = 'scale(1.05)';
        setTimeout(() => b.style.transform = '', 200);
      });
    }
  }

  function renderKeyboard() {
    const container = document.getElementById('keyboardContainer');
    container.innerHTML = '';
    const row = document.createElement('div');
    row.className = 'piano-row';
    
    noteList.forEach(note => {
      const isBlack = note.includes('#');
      const key = document.createElement('div');
      key.className = `key ${isBlack ? 'black-key' : ''}`;
      key.setAttribute('data-note', note);
      
      let sargamLabel = '';
      if (note === 'C') sargamLabel = 'SA';
      else if (note === 'D') sargamLabel = 'RE';
      else if (note === 'E') sargamLabel = 'GA';
      else if (note === 'F') sargamLabel = 'MA';
      else if (note === 'G') sargamLabel = 'PA';
      else if (note === 'A') sargamLabel = 'DHA';
      else if (note === 'B') sargamLabel = 'NI';
      
      let shortcut = '';
      for (let [k, v] of Object.entries(keyMap)) {
        if (v === note) {
          shortcut = k.toUpperCase();
          break;
        }
      }
      
      key.innerHTML = `
        <strong>${note}</strong>
        <span>${sargamLabel}</span>
        ${shortcut ? `<div class="shortcut">⌨️ ${shortcut}</div>` : ''}
      `;
      
      key.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startNote(note);
      });
      
      key.addEventListener('mouseup', () => stopNote(note));
      key.addEventListener('mouseleave', () => stopNote(note));
      key.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startNote(note);
      });
      key.addEventListener('touchend', (e) => {
        e.preventDefault();
        stopNote(note);
      });
      
      row.appendChild(key);
    });
    
    container.appendChild(row);
  }

  function updateKeywordPanel() {
    const panel = document.getElementById('keywordPanel');
    panel.innerHTML = '';
    const keywords = ['sa (C)', 're (D)', 'ga (E)', 'ma (F)', 'pa (G)', 'dha (A)', 'ni (B)', '1-7', 'C D E F G A B'];
    keywords.forEach(kw => {
      const badge = document.createElement('div');
      badge.className = 'keyword-badge';
      badge.textContent = kw;
      panel.appendChild(badge);
    });
  }

  function setInstrument(inst) {
    currentInstrument = inst;
    document.querySelectorAll('.inst-btn').forEach(btn => {
      if (btn.dataset.instr === inst) btn.classList.add('active');
      else btn.classList.remove('active');
    });
    
    
    for (let [id] of activeNotes) {
      activeNotes.delete(id);
    }
    pressedKeys.clear();
    
    const hint = document.getElementById('keyHint');
    hint.innerHTML = `<i class="fas fa-sync-alt"></i> ${inst.toUpperCase()}`;
    setTimeout(() => hint.innerHTML = '<i class="fas fa-play"></i> Ready', 1000);
  }

  const volumeSlider = document.getElementById('volumeSlider');
  const volumeValue = document.getElementById('volumeValue');
  volumeSlider.addEventListener('input', (e) => {
    masterVolume = parseFloat(e.target.value);
    volumeValue.textContent = `${Math.round(masterVolume * 100)}%`;
  });

  function init() {
    renderKeyboard();
    updateKeywordPanel();
    
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('keydown', onType);
    
    document.querySelectorAll('.inst-btn').forEach(btn => {
      btn.addEventListener('click', () => setInstrument(btn.dataset.instr));
    });
    
    const resumeAudio = () => {
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
        const hint = document.getElementById('keyHint');
        hint.innerHTML = '<i class="fas fa-check"></i> Audio Ready';
        setTimeout(() => hint.innerHTML = '<i class="fas fa-play"></i> Ready', 1000);
      } else if (!audioCtx) {
        initAudio();
      }
    };
    document.body.addEventListener('click', resumeAudio);
    document.body.addEventListener('touchstart', resumeAudio);
  }
  
  init();
})();