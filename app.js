/* ============================================================
   Workbench — app.js
   Tiny hash router + six self-contained tools.
   No dependencies, no data leaves the browser (QR preview
   excepted — see comment in renderQR).
   ============================================================ */

const stage = document.getElementById('stage');
const benchLinks = document.querySelectorAll('.bench-list a');

const routes = {
  '/':          renderHome,
  '/words':     renderWordCounter,
  '/password':  renderPassword,
  '/units':     renderUnits,
  '/color':     renderColor,
  '/qr':        renderQR,
  '/bmi':       renderBMI,
};

function router(){
  const hash = location.hash.replace('#', '') || '/';
  const render = routes[hash] || renderHome;

  benchLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + hash);
  });

  stage.innerHTML = '';
  render(stage);
  stage.focus?.();
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

/* small helper: build a tool shell */
function toolShell(eyebrow, title, desc, bodyHTML){
  return `
    <div class="panel">
      <div class="tool-head">
        <p class="tool-eyebrow">${eyebrow}</p>
        <h1>${title}</h1>
        <p>${desc}</p>
      </div>
      ${bodyHTML}
    </div>
  `;
}

/* ============================================================
   HOME
   ============================================================ */
function renderHome(root){
  root.innerHTML = `
    <div class="home-intro">
      <h1>Small tools, kept sharp.</h1>
      <p>Six things people reach for constantly, done properly and without the sign-up wall. Pick one off the bench.</p>
    </div>
    <div class="tile-grid">
      <a class="tile" href="#/words">
        <span class="tile-num">01</span>
        <h2>Word counter</h2>
        <p>Words, characters, sentences, and reading time as you type.</p>
      </a>
      <a class="tile" href="#/password">
        <span class="tile-num">02</span>
        <h2>Password generator</h2>
        <p>Strong random passwords with a live strength readout.</p>
      </a>
      <a class="tile" href="#/units">
        <span class="tile-num">03</span>
        <h2>Unit converter</h2>
        <p>Length, weight, and temperature, converted instantly.</p>
      </a>
      <a class="tile" href="#/color">
        <span class="tile-num">04</span>
        <h2>Color converter</h2>
        <p>Convert between HEX, RGB, and HSL, with a matching palette.</p>
      </a>
      <a class="tile" href="#/qr">
        <span class="tile-num">05</span>
        <h2>QR code generator</h2>
        <p>Turn any link or text into a downloadable QR code.</p>
      </a>
      <a class="tile" href="#/bmi">
        <span class="tile-num">06</span>
        <h2>BMI calculator</h2>
        <p>Quick body mass index check, in metric or imperial.</p>
      </a>
    </div>
  `;
}

/* ============================================================
   01 — WORD COUNTER
   ============================================================ */
function renderWordCounter(root){
  root.innerHTML = toolShell(
    'tool 01',
    'Word counter',
    'Paste or type text below. Every stat updates as you go — nothing is stored or sent anywhere.',
    `
      <div class="field">
        <label for="wc-input">Text</label>
        <textarea id="wc-input" placeholder="Start typing, or paste a paragraph here…"></textarea>
      </div>
      <div class="stat-grid">
        <div class="stat"><span class="num" id="wc-words">0</span><span class="lbl">words</span></div>
        <div class="stat"><span class="num" id="wc-chars">0</span><span class="lbl">characters</span></div>
        <div class="stat"><span class="num" id="wc-chars-ns">0</span><span class="lbl">chars (no spaces)</span></div>
        <div class="stat"><span class="num" id="wc-sentences">0</span><span class="lbl">sentences</span></div>
        <div class="stat"><span class="num" id="wc-paragraphs">0</span><span class="lbl">paragraphs</span></div>
        <div class="stat"><span class="num" id="wc-time">0s</span><span class="lbl">reading time</span></div>
      </div>
    `
  );

  const input = document.getElementById('wc-input');
  const els = {
    words: document.getElementById('wc-words'),
    chars: document.getElementById('wc-chars'),
    charsNs: document.getElementById('wc-chars-ns'),
    sentences: document.getElementById('wc-sentences'),
    paragraphs: document.getElementById('wc-paragraphs'),
    time: document.getElementById('wc-time'),
  };

  function update(){
    const text = input.value;
    const trimmed = text.trim();

    const words = trimmed ? (trimmed.match(/\S+/g) || []).length : 0;
    const chars = text.length;
    const charsNs = text.replace(/\s/g, '').length;
    const sentences = trimmed ? (trimmed.match(/[^.!?]+[.!?]+|\S+$/g) || []).filter(s => s.trim()).length : 0;
    const paragraphs = trimmed ? trimmed.split(/\n+/).filter(p => p.trim()).length : 0;

    const minutes = words / 200;
    const timeLabel = minutes < 1 ? `${Math.max(1, Math.round(minutes * 60))}s` : `${Math.round(minutes)} min`;

    els.words.textContent = words.toLocaleString();
    els.chars.textContent = chars.toLocaleString();
    els.charsNs.textContent = charsNs.toLocaleString();
    els.sentences.textContent = sentences.toLocaleString();
    els.paragraphs.textContent = paragraphs.toLocaleString();
    els.time.textContent = words ? timeLabel : '0s';
  }

  input.addEventListener('input', update);
  update();
}

/* ============================================================
   02 — PASSWORD GENERATOR
   ============================================================ */
function renderPassword(root){
  root.innerHTML = toolShell(
    'tool 02',
    'Password generator',
    'Generated locally using your browser\u2019s cryptographic random number generator — never sent over the network.',
    `
      <div class="readout">
        <span id="pw-output">click generate</span>
        <button class="copy-btn" id="pw-copy" type="button">Copy</button>
      </div>
      <div class="strength">
        <div class="strength-fill" id="pw-strength-fill"></div>
      </div>
      <p class="strength-label" id="pw-strength-label">—</p>

      <div class="field">
        <label for="pw-length">Length — <span id="pw-length-val">16</span> characters</label>
        <input type="range" id="pw-length" min="6" max="48" value="16">
      </div>

      <div class="check-row">
        <input type="checkbox" id="pw-upper" checked>
        <label for="pw-upper">Uppercase letters (A–Z)</label>
      </div>
      <div class="check-row">
        <input type="checkbox" id="pw-lower" checked>
        <label for="pw-lower">Lowercase letters (a–z)</label>
      </div>
      <div class="check-row">
        <input type="checkbox" id="pw-numbers" checked>
        <label for="pw-numbers">Numbers (0–9)</label>
      </div>
      <div class="check-row">
        <input type="checkbox" id="pw-symbols">
        <label for="pw-symbols">Symbols (!@#$%…)</label>
      </div>
      <div class="check-row">
        <input type="checkbox" id="pw-ambiguous">
        <label for="pw-ambiguous">Exclude look-alike characters (l, 1, I, O, 0)</label>
      </div>

      <div class="btn-row" style="margin-top:16px">
        <button id="pw-generate" type="button">Generate password</button>
      </div>
    `
  );

  const lengthInput = document.getElementById('pw-length');
  const lengthVal = document.getElementById('pw-length-val');
  const output = document.getElementById('pw-output');
  const copyBtn = document.getElementById('pw-copy');
  const genBtn = document.getElementById('pw-generate');
  const fill = document.getElementById('pw-strength-fill');
  const strengthLabel = document.getElementById('pw-strength-label');

  const checks = {
    upper: document.getElementById('pw-upper'),
    lower: document.getElementById('pw-lower'),
    numbers: document.getElementById('pw-numbers'),
    symbols: document.getElementById('pw-symbols'),
    ambiguous: document.getElementById('pw-ambiguous'),
  };

  const SETS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{};:,.<>?',
  };
  const AMBIGUOUS = /[lI1O0]/g;

  function buildCharset(){
    let set = '';
    if (checks.upper.checked) set += SETS.upper;
    if (checks.lower.checked) set += SETS.lower;
    if (checks.numbers.checked) set += SETS.numbers;
    if (checks.symbols.checked) set += SETS.symbols;
    if (checks.ambiguous.checked) set = set.replace(AMBIGUOUS, '');
    return set;
  }

  function generate(){
    const charset = buildCharset();
    const length = parseInt(lengthInput.value, 10);

    if (!charset){
      output.textContent = 'select at least one character type';
      fill.style.width = '0%';
      strengthLabel.textContent = '—';
      return;
    }

    const bytes = new Uint32Array(length);
    crypto.getRandomValues(bytes);
    let pw = '';
    for (let i = 0; i < length; i++){
      pw += charset[bytes[i] % charset.length];
    }
    output.textContent = pw;
    scoreStrength(pw, charset.length);
  }

  function scoreStrength(pw, poolSize){
    const entropy = pw.length * Math.log2(poolSize || 2);
    let pct, label, color;
    if (entropy < 40){ pct = 25; label = 'Weak'; color = '#AE4429'; }
    else if (entropy < 60){ pct = 50; label = 'Fair'; color = '#BD7C36'; }
    else if (entropy < 80){ pct = 75; label = 'Strong'; color = '#3E6B62'; }
    else { pct = 100; label = 'Very strong'; color = '#2C4A44'; }

    fill.style.width = pct + '%';
    fill.style.background = color;
    strengthLabel.textContent = `${label} — about ${Math.round(entropy)} bits of entropy`;
  }

  lengthInput.addEventListener('input', () => {
    lengthVal.textContent = lengthInput.value;
    generate();
  });
  Object.values(checks).forEach(c => c.addEventListener('change', generate));
  genBtn.addEventListener('click', generate);

  copyBtn.addEventListener('click', async () => {
    const text = output.textContent;
    if (!text || text.includes(' ')) return;
    try{
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Copied';
      setTimeout(() => copyBtn.textContent = 'Copy', 1200);
    }catch(e){ /* clipboard unavailable — silently ignore */ }
  });

  generate();
}

/* ============================================================
   03 — UNIT CONVERTER
   ============================================================ */
const UNIT_GROUPS = {
  length: {
    label: 'Length',
    base: 'm',
    units: {
      mm: 0.001, cm: 0.01, m: 1, km: 1000,
      in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344,
    },
  },
  weight: {
    label: 'Weight',
    base: 'kg',
    units: {
      mg: 0.000001, g: 0.001, kg: 1, t: 1000,
      oz: 0.0283495, lb: 0.453592,
    },
  },
  temperature: {
    label: 'Temperature',
    special: true,
  },
};

function renderUnits(root){
  root.innerHTML = toolShell(
    'tool 03',
    'Unit converter',
    'Length, weight, and temperature. Pick a category, then a unit on each side.',
    `
      <div class="field">
        <label for="un-group">Category</label>
        <select id="un-group">
          <option value="length">Length</option>
          <option value="weight">Weight</option>
          <option value="temperature">Temperature</option>
        </select>
      </div>
      <div class="field-row">
        <div class="field">
          <label for="un-from-val">From</label>
          <input type="number" id="un-from-val" value="1">
          <select id="un-from-unit" style="margin-top:8px"></select>
        </div>
        <div class="field">
          <label for="un-to-val">To</label>
          <input type="number" id="un-to-val" readonly>
          <select id="un-to-unit" style="margin-top:8px"></select>
        </div>
      </div>
    `
  );

  const groupSel = document.getElementById('un-group');
  const fromVal = document.getElementById('un-from-val');
  const toVal = document.getElementById('un-to-val');
  const fromUnit = document.getElementById('un-from-unit');
  const toUnit = document.getElementById('un-to-unit');

  function populateUnits(groupKey){
    const group = UNIT_GROUPS[groupKey];
    let keys;
    if (group.special){
      keys = ['C', 'F', 'K'];
    } else {
      keys = Object.keys(group.units);
    }
    fromUnit.innerHTML = keys.map(k => `<option value="${k}">${k}</option>`).join('');
    toUnit.innerHTML = keys.map(k => `<option value="${k}">${k}</option>`).join('');
    toUnit.selectedIndex = Math.min(1, keys.length - 1);
  }

  function convertTemp(value, from, to){
    let celsius;
    if (from === 'C') celsius = value;
    else if (from === 'F') celsius = (value - 32) * 5/9;
    else celsius = value - 273.15;

    if (to === 'C') return celsius;
    if (to === 'F') return celsius * 9/5 + 32;
    return celsius + 273.15;
  }

  function convert(){
    const groupKey = groupSel.value;
    const group = UNIT_GROUPS[groupKey];
    const val = parseFloat(fromVal.value);
    if (Number.isNaN(val)){ toVal.value = ''; return; }

    let result;
    if (group.special){
      result = convertTemp(val, fromUnit.value, toUnit.value);
    } else {
      const meters = val * group.units[fromUnit.value];
      result = meters / group.units[toUnit.value];
    }
    toVal.value = Number.isFinite(result) ? +result.toFixed(6) : '';
  }

  groupSel.addEventListener('change', () => { populateUnits(groupSel.value); convert(); });
  [fromVal, fromUnit, toUnit].forEach(el => el.addEventListener('input', convert));

  populateUnits('length');
  convert();
}

/* ============================================================
   04 — COLOR CONVERTER
   ============================================================ */
function renderColor(root){
  root.innerHTML = toolShell(
    'tool 04',
    'Color converter',
    'Enter a color in any format below — the other two update automatically, along with a five-step palette.',
    `
      <div class="swatch" id="cl-swatch"></div>
      <div class="field">
        <label for="cl-hex">HEX</label>
        <input type="text" id="cl-hex" value="#BD7C36">
      </div>
      <div class="field-row">
        <div class="field">
          <label for="cl-r">R</label>
          <input type="number" id="cl-r" min="0" max="255">
        </div>
        <div class="field">
          <label for="cl-g">G</label>
          <input type="number" id="cl-g" min="0" max="255">
        </div>
        <div class="field">
          <label for="cl-b">B</label>
          <input type="number" id="cl-b" min="0" max="255">
        </div>
      </div>
      <div class="field-row">
        <div class="field">
          <label for="cl-h">H</label>
          <input type="number" id="cl-h" min="0" max="360">
        </div>
        <div class="field">
          <label for="cl-s">S%</label>
          <input type="number" id="cl-s" min="0" max="100">
        </div>
        <div class="field">
          <label for="cl-l">L%</label>
          <input type="number" id="cl-l" min="0" max="100">
        </div>
      </div>
      <p class="hint">Palette — five lightness steps of the same hue:</p>
      <div class="palette-row" id="cl-palette"></div>
    `
  );

  const swatch = document.getElementById('cl-swatch');
  const hexInput = document.getElementById('cl-hex');
  const rI = document.getElementById('cl-r'), gI = document.getElementById('cl-g'), bI = document.getElementById('cl-b');
  const hI = document.getElementById('cl-h'), sI = document.getElementById('cl-s'), lI = document.getElementById('cl-l');
  const paletteRow = document.getElementById('cl-palette');

  function hexToRgb(hex){
    const m = hex.trim().replace('#', '');
    const full = m.length === 3 ? m.split('').map(c => c + c).join('') : m;
    if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
    return {
      r: parseInt(full.slice(0,2), 16),
      g: parseInt(full.slice(2,4), 16),
      b: parseInt(full.slice(4,6), 16),
    };
  }

  function rgbToHex({r,g,b}){
    return '#' + [r,g,b].map(v => Math.round(clamp(v,0,255)).toString(16).padStart(2,'0')).join('');
  }

  function clamp(v, min, max){ return Math.min(max, Math.max(min, v)); }

  function rgbToHsl({r,g,b}){
    r/=255; g/=255; b/=255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h, s, l = (max+min)/2;
    if (max === min){ h = s = 0; }
    else{
      const d = max - min;
      s = l > 0.5 ? d/(2-max-min) : d/(max+min);
      switch(max){
        case r: h = (g-b)/d + (g<b?6:0); break;
        case g: h = (b-r)/d + 2; break;
        case b: h = (r-g)/d + 4; break;
      }
      h *= 60;
    }
    return { h: Math.round(h), s: Math.round(s*100), l: Math.round(l*100) };
  }

  function hslToRgb({h,s,l}){
    h/=360; s/=100; l/=100;
    let r, g, b;
    if (s === 0){ r = g = b = l; }
    else{
      const hue2rgb = (p,q,t) => {
        if (t<0) t+=1;
        if (t>1) t-=1;
        if (t<1/6) return p+(q-p)*6*t;
        if (t<1/2) return q;
        if (t<2/3) return p+(q-p)*(2/3-t)*6;
        return p;
      };
      const q = l < 0.5 ? l*(1+s) : l+s-l*s;
      const p = 2*l-q;
      r = hue2rgb(p,q,h+1/3);
      g = hue2rgb(p,q,h);
      b = hue2rgb(p,q,h-1/3);
    }
    return { r: Math.round(r*255), g: Math.round(g*255), b: Math.round(b*255) };
  }

  function updatePalette(hsl){
    const steps = [15, 32, 50, 68, 85];
    paletteRow.innerHTML = steps.map(l => {
      const rgb = hslToRgb({ h: hsl.h, s: hsl.s, l });
      return `<div class="palette-swatch" style="background:${rgbToHex(rgb)}" title="L ${l}%"></div>`;
    }).join('');
  }

  function applyFromRgb(rgb, skip){
    const hex = rgbToHex(rgb);
    const hsl = rgbToHsl(rgb);
    swatch.style.background = hex;
    if (skip !== 'hex') hexInput.value = hex;
    if (skip !== 'rgb'){ rI.value = rgb.r; gI.value = rgb.g; bI.value = rgb.b; }
    if (skip !== 'hsl'){ hI.value = hsl.h; sI.value = hsl.s; lI.value = hsl.l; }
    updatePalette(hsl);
  }

  hexInput.addEventListener('input', () => {
    const rgb = hexToRgb(hexInput.value);
    if (rgb) applyFromRgb(rgb, 'hex');
  });

  [rI, gI, bI].forEach(el => el.addEventListener('input', () => {
    const rgb = { r: +rI.value || 0, g: +gI.value || 0, b: +bI.value || 0 };
    applyFromRgb(rgb, 'rgb');
  }));

  [hI, sI, lI].forEach(el => el.addEventListener('input', () => {
    const hsl = { h: +hI.value || 0, s: +sI.value || 0, l: +lI.value || 0 };
    applyFromRgb(hslToRgb(hsl), 'hsl');
  }));

  applyFromRgb(hexToRgb('#BD7C36'));
}

/* ============================================================
   05 — QR CODE GENERATOR
   ------------------------------------------------------------
   Generating a correct QR code (Reed–Solomon error correction,
   masking, format bits) from scratch is easy to get subtly
   wrong. Rather than ship a hand-rolled encoder that might
   silently produce broken codes, this uses the well-established
   free goqr.me image API — the only tool on this page that makes
   a network request, and it only sends the text you choose to
   encode, only when you use this one tool.
   ============================================================ */
function renderQR(root){
  root.innerHTML = toolShell(
    'tool 05',
    'QR code generator',
    'Type a link or a short message and a QR code appears below, ready to download.',
    `
      <div class="field">
        <label for="qr-text">Link or text</label>
        <input type="text" id="qr-text" placeholder="https://example.com" value="https://example.com">
      </div>
      <div class="qr-preview" id="qr-preview">
        <img id="qr-img" alt="Generated QR code" width="220" height="220">
      </div>
      <div class="btn-row">
        <a id="qr-download" download="qr-code.png"><button type="button">Download PNG</button></a>
      </div>
      <p class="hint">This is the one tool on the page that calls an outside service (goqr.me) to draw the code — only the text you enter here is sent, and only when you use this tool.</p>
    `
  );

  const textInput = document.getElementById('qr-text');
  const img = document.getElementById('qr-img');
  const downloadLink = document.getElementById('qr-download');

  function build(){
    const text = textInput.value.trim() || 'https://example.com';
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=440x440&data=${encodeURIComponent(text)}`;
    img.src = url;
    downloadLink.href = url;
  }

  textInput.addEventListener('input', build);
  build();
}

/* ============================================================
   06 — BMI CALCULATOR
   ============================================================ */
function renderBMI(root){
  root.innerHTML = toolShell(
    'tool 06',
    'BMI calculator',
    'A quick body mass index estimate. BMI is a rough screening tool, not a diagnosis — it doesn\u2019t account for muscle mass, frame, or age.',
    `
      <div class="field">
        <label for="bmi-units">Units</label>
        <select id="bmi-units">
          <option value="metric">Metric (kg / cm)</option>
          <option value="imperial">Imperial (lb / in)</option>
        </select>
      </div>
      <div class="field-row">
        <div class="field">
          <label for="bmi-weight" id="bmi-weight-label">Weight (kg)</label>
          <input type="number" id="bmi-weight" min="0" value="70">
        </div>
        <div class="field">
          <label for="bmi-height" id="bmi-height-label">Height (cm)</label>
          <input type="number" id="bmi-height" min="0" value="170">
        </div>
      </div>
      <div class="bmi-result">
        <span class="num" id="bmi-num">—</span>
        <span class="cat" id="bmi-cat">Enter your weight and height</span>
      </div>
    `
  );

  const unitsSel = document.getElementById('bmi-units');
  const weightInput = document.getElementById('bmi-weight');
  const heightInput = document.getElementById('bmi-height');
  const weightLabel = document.getElementById('bmi-weight-label');
  const heightLabel = document.getElementById('bmi-height-label');
  const num = document.getElementById('bmi-num');
  const cat = document.getElementById('bmi-cat');

  function category(bmi){
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Healthy range';
    if (bmi < 30) return 'Overweight';
    return 'Obesity range';
  }

  function update(){
    const isMetric = unitsSel.value === 'metric';
    weightLabel.textContent = isMetric ? 'Weight (kg)' : 'Weight (lb)';
    heightLabel.textContent = isMetric ? 'Height (cm)' : 'Height (in)';

    const w = parseFloat(weightInput.value);
    const h = parseFloat(heightInput.value);
    if (!w || !h){ num.textContent = '—'; cat.textContent = 'Enter your weight and height'; return; }

    let bmi;
    if (isMetric){
      bmi = w / Math.pow(h / 100, 2);
    } else {
      bmi = (w / Math.pow(h, 2)) * 703;
    }

    num.textContent = bmi.toFixed(1);
    cat.textContent = category(bmi);
  }

  unitsSel.addEventListener('change', update);
  weightInput.addEventListener('input', update);
  heightInput.addEventListener('input', update);
  update();
}
