// Elements
const els = {
  input: document.getElementById('mmd-input'),
  preview: document.getElementById('preview'),
  errBox: document.getElementById('error'),
  errHint: document.getElementById('error-hint'),
  errRaw: document.getElementById('raw-error'),
  errClose: document.getElementById('error-close'),
  toggleRawError: document.getElementById('toggle-raw-error'),
  toast: document.getElementById('toast'),
  theme: document.getElementById('theme'),
  direction: document.getElementById('direction'),
  scale: document.getElementById('scale'),
  bg: document.getElementById('bg'),
  padding: document.getElementById('padding'),
  filename: document.getElementById('filename'),
  btnRender: document.getElementById('btn-render'),
  btnClear: document.getElementById('btn-clear'),
  btnCopySvg: document.getElementById('btn-copy-svg'),
  btnDownloadSvg: document.getElementById('btn-download-svg'),
  btnDownloadPng: document.getElementById('btn-download-png'),
  btnPermalink: document.getElementById('btn-permalink'),
  templateDropdown: document.getElementById('template-dropdown'),
  templateList: document.getElementById('template-list'),
  toggleAdvanced: document.getElementById('toggle-advanced'),
  advancedPanel: document.getElementById('advanced-panel'),
  btnReset: document.getElementById('btn-reset'),
  presetPoster: document.getElementById('preset-poster'),
  presetLms: document.getElementById('preset-lms'),
  presetQuickShare: document.getElementById('preset-quickshare'),
};

const LS_KEYS = {
  diagramText: 'mmd.diagramText',
  theme: 'mmd.theme',
  direction: 'mmd.direction',
  export: 'mmd.export',
  lastTemplateKey: 'mmd.lastTemplateKey',
};



// Initialize Mermaid
function initMermaid() {
  const theme = els.theme.value || 'default';
  mermaid.initialize({
    startOnLoad: false,
    theme,
    securityLevel: 'strict',
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
    flowchart: {
      diagramPadding: parseInt(els.padding.value || '16', 10),
      htmlLabels: true,
      curve: 'basis',
    },
  });
}

// Render diagram
async function renderDiagram() {
  hideError();
  showToast('Rendering...', 'is-link');

  const raw = els.input.value.trim();
  if (!raw) {
    showToast('No Mermaid code to render.', 'is-warning');
    return;
  }

  const text = injectDirection(raw, els.direction.value);
  initMermaid();

  try {
    const { svg } = await mermaid.render('mermaid-svg-id', text);
    els.preview.innerHTML = svg;
    showToast('Rendered successfully.', 'is-success');
    saveState();
  } catch (e) {
    showError(e);
    showToast('Failed to render. Check your syntax.', 'is-danger');
  }
}

// Direction helper
function injectDirection(src, dir) {
  if (!dir) return src;
  const m = src.match(/^\s*(flowchart|graph)\s+([A-Za-z]{2})/);
  if (m) return src.replace(m[0], `${m[1]} ${dir}`);
  const n = src.match(/^\s*(flowchart|graph)\s*$/m);
  if (n) return src.replace(n[0], `${n[1]} ${dir}`);
  return src;
}

// Downloads
function downloadSVG() {
  const svgEl = els.preview.querySelector('svg');
  if (!svgEl) return showToast('Nothing to download. Render first.', 'is-warning');
  const svgText = svgEl.outerHTML;
  const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${safeFilename()}.svg`);
}

async function downloadPNG() {
  try {
    const svgEl = els.preview.querySelector('svg');
    if (!svgEl) return showToast('Nothing to download. Render first.', 'is-warning');

    const scale = parseInt(els.scale.value || '2', 10);
    const bg = (els.bg.value || '').toLowerCase();
    const pad = parseInt(els.padding.value || '16', 10);

    const svgText = addPaddingToSVG(svgEl.outerHTML, pad, bg);

    // Compute size
    const { width, height } = getSvgSize(svgText, svgEl);

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.floor(width * scale));
    canvas.height = Math.max(1, Math.floor(height * scale));
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;

    // Prefer native browser SVG rendering for best text fidelity
    try {
      await drawSvgToCanvasNative(svgText, canvas);
    } catch (nativeErr) {
      console.warn('Native SVG->Canvas failed, falling back to Canvg:', nativeErr);
      await drawSvgToCanvasCanvg(svgText, canvas, ctx, bg);
    }

    const url = canvas.toDataURL('image/png');
    triggerDownload(url, `${safeFilename()}.png`);
  } catch (e) {
    console.error(e);
    showToast('PNG export failed. See console for details.', 'is-danger');
  }
}

function addPaddingToSVG(svgText, padding, bg) {
  if (!padding || padding <= 0) return svgText;
  try {
    const tmp = document.createElement('div');
    tmp.innerHTML = svgText;
    const svg = tmp.querySelector('svg');
    if (!svg) return svgText;

    const vb = svg.getAttribute('viewBox');
    if (vb) {
      const parts = vb.split(' ').map(Number);
      const [minX, minY, w, h] = parts;
      svg.setAttribute('viewBox', `${minX - padding} ${minY - padding} ${w + padding * 2} ${h + padding * 2}`);
    } else {
      const width = parseFloat(svg.getAttribute('width')) || null;
      const height = parseFloat(svg.getAttribute('height')) || null;
      if (width && height) {
        svg.setAttribute('width', (width + padding * 2).toString());
        svg.setAttribute('height', (height + padding * 2).toString());
      }
    }
    if (bg && bg !== 'transparent') {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', (-(padding)).toString());
      rect.setAttribute('y', (-(padding)).toString());
      rect.setAttribute('width', '100%');
      rect.setAttribute('height', '100%');
      rect.setAttribute('fill', bg);
      svg.insertBefore(rect, svg.firstChild);
    }
    return svg.outerHTML;
  } catch {
    return svgText;
  }
}

function getSvgSize(svgText, fallbackEl) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const svgNode = doc.documentElement;
    const vb = svgNode.getAttribute('viewBox');
    let width = parseFloat(svgNode.getAttribute('width'));
    let height = parseFloat(svgNode.getAttribute('height'));
    if ((!width || !height) && vb) {
      const parts = vb.split(/\s+/).map(Number);
      if (parts.length === 4) {
        width = parts[2];
        height = parts[3];
      }
    }
    if ((!width || !height) && fallbackEl) {
      const bbox = fallbackEl.getBoundingClientRect();
      width = width || bbox.width || 1;
      height = height || bbox.height || 1;
    }
    return { width: Math.max(1, width || 1), height: Math.max(1, height || 1) };
  } catch {
    const bbox = fallbackEl?.getBoundingClientRect?.() || { width: 1, height: 1 };
    return { width: Math.max(1, bbox.width || 1), height: Math.max(1, bbox.height || 1) };
  }
}

async function drawSvgToCanvasNative(svgText, canvas) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      try {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve();
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

async function drawSvgToCanvasCanvg(svgText, canvas, ctx, bg) {
  // Detect Canvg variants from UMD bundle
  const canvgNS = window.canvg || window.Canvg || (window.canvg && window.canvg.Canvg);
  if (!canvgNS) throw new Error('Canvg not available');
  let v;
  if (canvgNS.Canvg && typeof canvgNS.Canvg.fromString === 'function') {
    v = await canvgNS.Canvg.fromString(ctx, svgText, { ignoreMouse: true, ignoreAnimation: true });
  } else if (typeof canvgNS.fromString === 'function') {
    v = await canvgNS.fromString(ctx, svgText, { ignoreMouse: true, ignoreAnimation: true });
  } else if (window.Canvg && typeof window.Canvg.fromString === 'function') {
    v = await window.Canvg.fromString(ctx, svgText, { ignoreMouse: true, ignoreAnimation: true });
  } else {
    throw new Error('Canvg.fromString not found');
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (bg && bg !== 'transparent') {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  await v.render();
}

// Clipboard & permalink
async function copySVG() {
  const svgEl = els.preview.querySelector('svg');
  if (!svgEl) return showToast('Nothing to copy. Render first.', 'is-warning');
  const svgText = svgEl.outerHTML;
  try {
    await navigator.clipboard.writeText(svgText);
    showToast('SVG copied to clipboard.', 'is-info');
  } catch {
    showToast('Clipboard permission denied.', 'is-danger');
  }
}

function copyPermalink() {
  const code = els.input.value.trim();
  if (!code) return showToast('No code to link.', 'is-warning');
  const cfg = currentConfig();
  const payload = { code, cfg };
  const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(payload)))));
  const url = `${location.origin}${location.pathname}#${encoded}`;
  navigator.clipboard.writeText(url).then(
    () => showToast('Permalink copied.', 'is-info'),
    () => showToast('Failed to copy permalink.', 'is-danger')
  );
}

function loadFromHash() {
  if (!location.hash) return;
  try {
    const encoded = location.hash.slice(1);
    const json = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(encoded)))));
    if (json.code) els.input.value = json.code;
    if (json.cfg) applyConfig(json.cfg);
    renderDiagram();
  } catch {
    // ignore malformed
  }
}

// Config & state
function currentConfig() {
  return {
    theme: els.theme.value,
    direction: els.direction.value,
    export: {
      scale: els.scale.value,
      bg: els.bg.value,
      padding: els.padding.value,
      filename: els.filename.value,
    },
  };
}

function applyConfig(cfg) {
  if (!cfg) return;
  if (cfg.theme) els.theme.value = cfg.theme;
  if (cfg.direction) els.direction.value = cfg.direction;
  if (cfg.export) {
    els.scale.value = cfg.export.scale ?? els.scale.value;
    els.bg.value = cfg.export.bg ?? els.bg.value;
    els.padding.value = cfg.export.padding ?? els.padding.value;
    els.filename.value = cfg.export.filename ?? els.filename.value;
  }
}

function saveState() {
  localStorage.setItem(LS_KEYS.diagramText, els.input.value);
  localStorage.setItem(LS_KEYS.theme, els.theme.value);
  localStorage.setItem(LS_KEYS.direction, els.direction.value);
  localStorage.setItem(LS_KEYS.export, JSON.stringify({
    scale: els.scale.value,
    bg: els.bg.value,
    padding: els.padding.value,
    filename: els.filename.value,
  }));
}

function restoreState() {
  const text = localStorage.getItem(LS_KEYS.diagramText);
  if (text) els.input.value = text;
  const theme = localStorage.getItem(LS_KEYS.theme);
  if (theme) els.theme.value = theme;
  const direction = localStorage.getItem(LS_KEYS.direction);
  if (direction) els.direction.value = direction;
  const exportCfg = localStorage.getItem(LS_KEYS.export);
  if (exportCfg) applyConfig({ export: JSON.parse(exportCfg) });

  const lastTemplate = localStorage.getItem(LS_KEYS.lastTemplateKey);
  if (lastTemplate) els.templateDropdown.setAttribute('data-last-template', lastTemplate);
}

function resetDefaults() {
  els.theme.value = 'default';
  els.direction.value = '';
  els.scale.value = '2';
  els.bg.value = '#ffffff';
  els.padding.value = '16';
  els.filename.value = 'diagram';
  showToast('Settings reset to defaults.', 'is-warning');
  saveState();
}

// Helpers
function triggerDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL?.(url);
}

function safeFilename() {
  const base = (els.filename.value || 'diagram').trim();
  return base.replace(/[^a-z0-9_\-\.]/gi, '_');
}

let toastTimeout;
function showToast(msg, color = 'is-info') {
  els.toast.className = `notification ${color}`;
  els.toast.textContent = msg;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    els.toast.classList.add('is-hidden');
  }, 2500);
}

// Error handling with friendly hints
function showError(e) {
  const message = e?.message || String(e);
  const hint = makeFriendlyHint(message);
  els.errHint.textContent = hint;
  els.errRaw.textContent = message;
  els.errBox.classList.remove('is-hidden');
}

function hideError() {
  els.errBox.classList.add('is-hidden');
  els.errHint.textContent = '';
  els.errRaw.textContent = '';
}

function makeFriendlyHint(raw) {
  const lower = (raw || '').toLowerCase();
  if (lower.includes('lexical') || lower.includes('parse')) {
    return 'Tip: Start with a diagram type (e.g., "graph TD", "flowchart LR", "sequenceDiagram"). Check arrows and colons.';
  }
  if (lower.includes('unexpected token')) {
    return 'Tip: Check for missing or extra characters. For flowcharts, use "-->" for edges and ":" labels correctly.';
  }
  if (lower.includes('unknown diagram type')) {
    return 'Tip: Use a supported type like "flowchart", "sequenceDiagram", "classDiagram", "stateDiagram-v2".';
  }
  return 'Something went wrong rendering your diagram. Check the first line and overall syntax.';
}

// Template dropdown UI
function buildTemplateDropdown() {
  const categories = [...new Set(TEMPLATES.map(t => t.category))];
  els.templateList.innerHTML = '';
  categories.forEach((cat, i) => {
    const catItem = document.createElement('div');
    catItem.className = 'dropdown-item is-category';
    catItem.textContent = cat;
    els.templateList.appendChild(catItem);

    TEMPLATES.filter(t => t.category === cat).forEach(t => {
      const item = document.createElement('a');
      item.className = 'dropdown-item';
      item.href = '#';
      item.textContent = t.label;
      item.addEventListener('click', (ev) => {
        ev.preventDefault();
        els.input.value = t.code;
        localStorage.setItem(LS_KEYS.lastTemplateKey, t.key);
        renderDiagram();
        toggleDropdown(false);
      });
      els.templateList.appendChild(item);
    });

    if (i < categories.length - 1) {
      const divider = document.createElement('hr');
      divider.className = 'dropdown-divider';
      els.templateList.appendChild(divider);
    }
  });

  const trigger = els.templateDropdown.querySelector('.dropdown-trigger .button');
  trigger.addEventListener('click', () => toggleDropdown());
  document.addEventListener('click', (e) => {
    if (!els.templateDropdown.contains(e.target)) toggleDropdown(false);
  });
}

function toggleDropdown(force) {
  if (force === false) els.templateDropdown.classList.remove('is-active');
  else els.templateDropdown.classList.toggle('is-active');
}

// Advanced panel toggle
function bindAdvancedToggle() {
  els.toggleAdvanced.addEventListener('click', () => {
    const isHidden = els.advancedPanel.classList.contains('is-hidden');
    els.advancedPanel.classList.toggle('is-hidden');
    els.toggleAdvanced.textContent = isHidden ? 'More options ▾' : 'More options ▸';
  });
}

// Presets (pre-fill settings, no auto-download)
function applyPresetPoster() {
  els.scale.value = '3';
  els.bg.value = '#ffffff';
  els.padding.value = '32';
  showToast('Poster mode preset applied.', 'is-warning');
  saveState();
}
function applyPresetLms() {
  els.scale.value = '2';
  els.bg.value = 'transparent';
  els.padding.value = '16';
  showToast('LMS mode preset applied.', 'is-info');
  saveState();
}
function applyPresetQuickShare() {
  showToast('Quick share: use Copy SVG or Permalink.', 'is-light');
}

// Bind events
function bindEvents() {
  els.btnRender.addEventListener('click', renderDiagram);
  els.btnClear.addEventListener('click', () => {
    els.input.value = '';
    els.preview.innerHTML = '';
    hideError();
    showToast('Cleared.', 'is-light');
  });
  els.theme.addEventListener('change', renderDiagram);
  els.direction.addEventListener('change', renderDiagram);

  els.btnCopySvg.addEventListener('click', copySVG);
  els.btnDownloadSvg.addEventListener('click', downloadSVG);
  els.btnDownloadPng.addEventListener('click', downloadPNG);
  els.btnPermalink.addEventListener('click', copyPermalink);

  els.errClose.addEventListener('click', hideError);
  els.toggleRawError.addEventListener('click', () => {
    els.errRaw.classList.toggle('is-hidden');
    els.toggleRawError.textContent = els.errRaw.classList.contains('is-hidden')
      ? 'Show details ▸' : 'Hide details ▾';
  });

  bindAdvancedToggle();

  els.btnReset.addEventListener('click', resetDefaults);

  els.presetPoster.addEventListener('click', applyPresetPoster);
  els.presetLms.addEventListener('click', applyPresetLms);
  els.presetQuickShare.addEventListener('click', applyPresetQuickShare);

  // Keyboard shortcut
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      renderDiagram();
    }
  });
}

// Boot
(function main() {
  restoreState();
  initMermaid();
  bindEvents();
  buildTemplateDropdown();
  loadFromHash();
})();
