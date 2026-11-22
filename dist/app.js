'use strict';

const count = moods.length * places.length;
const storageKey = 'band-name-radio-v1';
const $ = id => document.getElementById(id);
const colors = ['#a84916', '#216773', '#93445b', '#505f36', '#564e85', '#245c95'];
const seed = () => Math.floor(Math.random() * 0x100000000);

function readState() {
  try {
    const s = JSON.parse(localStorage.getItem(storageKey));
    const validId = n => Number.isInteger(n) && n >= 0 && n < count;
    if (s && Number.isInteger(s.seed) && Number.isInteger(s.cursor) && s.cursor > 0 &&
        s.cursor <= count && Array.isArray(s.history) && s.history.length > 0 &&
        s.history.length <= 8 && s.history.every(validId) && s.history.includes(s.current)) return s;
  } catch { /* Storage is optional, including when the page is opened as a file. */ }
  return { seed:seed(), cursor:0, history:[], current:null, sound:false };
}

const state = readState();
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* Keep this session usable. */ }
}

// A seeded shuffle restores the exact remaining deck from a seed and a cursor.
function shuffledDeck(initialSeed) {
  const deck = Uint32Array.from({length:count}, (_, i) => i);
  let s = initialSeed;
  for (let i = count - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = Math.floor(s / 0x100000000 * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
let deck = shuffledDeck(state.seed);
function pair(id) { return [moods[Math.floor(id / places.length)], places[id % places.length]]; }

function hiddenTrack(left, right, id) {
  if (/^(午夜|子夜|失眠|凌晨|无眠)$/.test(left) && /台|站|馆|室|局|铺/.test(right)) return '隐藏曲目 · 通宵营业';
  if (/^(退潮|赤潮|潜水|海底|远洋|离岸)$/.test(left) && /海|鲸|鱼|船|水|锚|港/.test(right)) return '隐藏曲目 · 水下演出';
  if (/^(走调|跳针|失真|破音|半拍)$/.test(left)) return '隐藏曲目 · 即兴返场';
  if (id % 79 === 0) return '隐藏曲目 · B 面单曲';
  return '';
}

let context;
let previousPhrase;
async function play(id) {
  if (!state.sound) return;
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) return;
  try {
    context ??= new Audio();
    await context.resume();
    if (!state.sound || state.current !== id) return;
    previousPhrase?.disconnect();
    const output = context.createGain();
    output.gain.value = 0.1;
    output.connect(context.destination);
    previousPhrase = output;
    const scale = [0, 3, 5, 7, 10, 12];
    const root = 110 * 2 ** ((id % 12) / 12);
    const start = context.currentTime + 0.015;
    for (let i = 0; i < 4; i++) {
      const time = start + i * 0.14;
      const note = context.createOscillator();
      const envelope = context.createGain();
      note.type = 'triangle';
      note.frequency.value = root * 2 ** (scale[Math.floor(id / 6 ** i) % 6] / 12);
      envelope.gain.setValueAtTime(0.001, time);
      envelope.gain.exponentialRampToValueAtTime(0.8, time + 0.008);
      envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
      note.connect(envelope).connect(output);
      note.start(time);
      note.stop(time + 0.26);
      if (i === 3) note.onended = () => output.disconnect();
    }
  } catch { /* Animation still works when audio output is unavailable. */ }
}

function drawName(animate, heard = true) {
  const [left, right] = pair(state.current);
  $('left').textContent = left;
  $('right').textContent = right;
  $('name').setAttribute('aria-label', '重放' + left + right);
  document.documentElement.style.setProperty('--chars', left.length + right.length);
  document.documentElement.style.setProperty('--accent', colors[state.current % colors.length]);
  const egg = hiddenTrack(left, right, state.current);
  $('egg').textContent = egg;
  $('egg').hidden = !egg;
  $('announce').textContent = left + right + (egg ? '，' + egg : '');
  for (const chip of $('history').children) {
    chip.setAttribute('aria-current', String(Number(chip.dataset.id) === state.current));
  }
  if (animate && !matchMedia('(prefers-reduced-motion: reduce)').matches && $('left').animate) {
    for (const [node, x, delay] of [[$('left'), -12, 0], [$('right'), 12, 45]]) {
      node.getAnimations().forEach(a => a.cancel());
      node.animate([{ opacity:0, transform:'translateX(' + x + 'px)' }, { opacity:1, transform:'none' }],
        { duration:220, delay, fill:'backwards', easing:'ease-out' });
    }
  }
  if (heard) play(state.current);
}

function renderHistory() {
  $('history').replaceChildren(...state.history.map(id => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.dataset.id = id;
    chip.textContent = pair(id).join('');
    chip.title = '重放' + chip.textContent;
    chip.addEventListener('click', () => {
      state.current = id;
      save();
      drawName(true);
    });
    return chip;
  }));
}

function generate(heard = true) {
  if (state.cursor === count) {
    do {
      state.seed = seed();
      deck = shuffledDeck(state.seed);
    } while (state.history.includes(deck[0]));
    state.cursor = 0;
  }
  state.current = deck[state.cursor++];
  state.history = [state.current, ...state.history.filter(id => id !== state.current)].slice(0, 8);
  save();
  renderHistory();
  drawName(true, heard);
}

function updateSound() {
  $('sound').setAttribute('aria-pressed', String(state.sound));
  $('sound-label').textContent = state.sound ? '声音开' : '声音关';
}
$('sound').addEventListener('click', () => {
  state.sound = !state.sound;
  if (state.sound) play(state.current);
  else previousPhrase?.disconnect();
  updateSound();
  save();
});
$('generate').addEventListener('click', () => generate());
$('name').addEventListener('click', () => drawName(true));
document.addEventListener('click', e => {
  if (!e.target.closest('button,a') && !window.getSelection()?.toString()) generate();
});
document.addEventListener('keydown', e => {
  if (e.code !== 'Space' || e.altKey || e.ctrlKey || e.metaKey || e.target.closest('button,a,input,textarea,[contenteditable]')) return;
  e.preventDefault();
  if (!e.repeat) generate();
});
updateSound();
if (state.current === null) generate(false);
else {
  renderHistory();
  drawName(false, false);
}
