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
  diagramType: document.getElementById('diagram-type'),
  engineBadge: document.getElementById('engine-badge'),
  krokiBase: document.getElementById('kroki-base'),
  suppressEngineWarning: document.getElementById('suppress-engine-warning'),
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
  diagramEngine: 'mmd.diagramEngine',
  krokiBase: 'mmd.krokiBase',
  suppressEngineWarning: 'mmd.suppressEngineWarning',
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
  const selectedEngine = els.diagramType?.value || 'mermaid';
  
  // Route to Plain Text renderer
  if (selectedEngine === 'plaintext') {
    renderPlainText(els.input.value);
    saveState();
    return;
  }
  
  // Route to Kroki renderer for remote engines
  if (selectedEngine !== 'mermaid') {
    try {
      await renderKroki(selectedEngine, els.input.value);
      saveState();
      showToast('Rendered via Kroki.', 'is-success');
    } catch (err) {
      showError(err);
      showToast('Remote rendering failed. See details.', 'is-danger');
    }
    return;
  }

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
  const selectedEngine = els.diagramType?.value || 'mermaid';
  
  // Plain text doesn't produce SVG
  if (selectedEngine === 'plaintext') {
    showToast('SVG export not available for plain text', 'is-info');
    return;
  }
  
  const svgEl = els.preview.querySelector('svg');
  if (!svgEl) return showToast('Nothing to download. Render first.', 'is-warning');
  
  // Clone SVG and ensure xmlns attribute exists for proper XML rendering
  const svgClone = svgEl.cloneNode(true);
  if (!svgClone.hasAttribute('xmlns')) {
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  
  // Use XMLSerializer to get proper XML formatting (not HTML entities)
  const serializer = new XMLSerializer();
  const svgText = serializer.serializeToString(svgClone);
  
  const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${safeFilename()}.svg`);
}

async function downloadPNG() {
  try {
    const selectedEngine = els.diagramType?.value || 'mermaid';
    const filename = safeFilename();
    
    // Handle Plain Text engine
    if (selectedEngine === 'plaintext') {
      const exportSettings = {
        scale: els.scale.value || '2',
        bg: els.bg.value || '#ffffff',
        padding: els.padding.value || '16',
        filename: filename
      };
      downloadPlainTextPNG(els.input.value, exportSettings);
      return;
    }

    if (selectedEngine !== 'mermaid') {
      // For non-Mermaid engines, try Kroki PNG endpoint first
      // If that fails (e.g., D2 doesn't support PNG), fall back to SVG->Canvas conversion
      try {
        await downloadPngFromKroki(selectedEngine, els.input.value, filename);
        showToast('PNG downloaded from Kroki.', 'is-success');
        return;
      } catch (err) {
        console.warn('Kroki PNG endpoint failed, trying SVG->Canvas conversion:', err);
        // Fall through to SVG->Canvas conversion below
      }
    }

    const svgEl = els.preview.querySelector('svg');
    if (!svgEl) return showToast('Nothing to download. Render first.', 'is-warning');

    const scale = parseInt(els.scale.value || '2', 10);
    const bg = (els.bg.value || '').toLowerCase();
    const pad = parseInt(els.padding.value || '16', 10);

    // Clone SVG and ensure xmlns attribute for proper rendering
    const svgClone = svgEl.cloneNode(true);
    if (!svgClone.hasAttribute('xmlns')) {
      svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }

    // Use XMLSerializer to avoid HTML entity encoding issues
    const serializer = new XMLSerializer();
    const svgText = addPaddingToSVG(serializer.serializeToString(svgClone), pad, bg);

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
    // Use DOMParser to properly parse XML/SVG
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const svg = doc.documentElement;
    
    // Check for parsing errors
    const parserError = svg.querySelector('parsererror');
    if (parserError || svg.tagName !== 'svg') return svgText;

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
    
    // Serialize back to string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svg);
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

// Fetch with timeout helper
async function fetchWithTimeout(url, opts = {}, timeout = 20000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// Robust Kroki request with fallbacks for recent API changes
// Tries POST text/plain first, then POST application/json { diagram_source }
// For Graphviz, also falls back from 'graphviz' to 'dot' type if needed
async function krokiRequest(engineType, format, code, timeout = 20000) {
  const base = (els.krokiBase && els.krokiBase.value)
    ? els.krokiBase.value.replace(/\/+$/, '')
    : 'https://kroki.io';

  const accept = format === 'png' ? 'image/png' : 'image/svg+xml';

  const tryOnce = async (type, style) => {
    const url = `${base}/${type}/${format}`;
    if (style === 'text') {
      return await fetchWithTimeout(
        url,
        { method: 'POST', headers: { 'Content-Type': 'text/plain', 'Accept': accept }, body: code },
        timeout
      );
    } else if (style === 'json') {
      // Kroki also supports JSON body with diagram_source
      return await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': accept },
          body: JSON.stringify({ diagram_source: code }),
        },
        timeout
      );
    }
    throw new Error('Unknown request style');
  };

  // 1) Try text/plain for declared type
  try {
    let res = await tryOnce(engineType, 'text');
    if (res.ok) return res;
    // 2) Try JSON for declared type
    res = await tryOnce(engineType, 'json');
    if (res.ok) return res;

    // 3) Graphviz may be exposed as 'dot' on some instances; try fallbacks
    if (engineType === 'graphviz') {
      res = await tryOnce('dot', 'text');
      if (res.ok) return res;
      res = await tryOnce('dot', 'json');
      if (res.ok) return res;
    }

    // If none worked, return the last response (will have status)
    return res;
  } catch (err) {
    // Network error on text/plain; try JSON, then graphviz/dot
    try {
      let res = await tryOnce(engineType, 'json');
      if (res.ok) return res;
      if (engineType === 'graphviz') {
        res = await tryOnce('dot', 'text');
        if (res.ok) return res;
        res = await tryOnce('dot', 'json');
        if (res.ok) return res;
      }
      // As a last resort, attempt GET-encoded fallback
      if (['svg','png'].includes(format)) {
        try {
          const getRes = await krokiGetEncoded(engineType, format, code, timeout);
          if (getRes && getRes.ok) return getRes;
        } catch (_) { /* ignore */ }
      }
      return res; // not ok
    } catch (err2) {
      // Surface the error
      throw err2;
    }
  }
}

// GET fallback using Kroki's encoded URL scheme (deflate + base64url)
async function krokiGetEncoded(engineType, format, code, timeout = 20000) {
  const base = (els.krokiBase && els.krokiBase.value)
    ? els.krokiBase.value.replace(/\/+$/, '')
    : 'https://kroki.io';
  const accept = format === 'png' ? 'image/png' : 'image/svg+xml';
  const encoded = await encodeKrokiSource(code);
  const url = `${base}/${engineType}/${format}/${encoded}`;
  return await fetchWithTimeout(url, { headers: { 'Accept': accept } }, timeout);
}

// Encode using deflate + base64url (no padding). Uses CompressionStream when available.
async function encodeKrokiSource(text) {
  if (typeof CompressionStream === 'function') {
    const cs = new CompressionStream('deflate');
    const writer = cs.writable.getWriter();
    await writer.write(new TextEncoder().encode(text));
    await writer.close();
    const buf = await new Response(cs.readable).arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/=+$/,'').replace(/\+/g,'-').replace(/\//g,'_');
  } else {
    // No deflate available; fall back to uncompressed base64url (may be rejected for size)
    const enc = new TextEncoder().encode(text);
    let binary = '';
    for (let i = 0; i < enc.length; i++) binary += String.fromCharCode(enc[i]);
    return btoa(binary).replace(/=+$/,'').replace(/\+/g,'-').replace(/\//g,'_');
  }
}

// ============================================================================
// PLAIN TEXT RENDERING (Canvas-based)
// ============================================================================

/**
 * Render plain text to canvas with monospace font
 * Handles HTML tags as literal text, preserves box-drawing characters
 * @param {string} text - Raw text content
 * @param {Object} options - Rendering options
 * @returns {HTMLCanvasElement} - Canvas with rendered text
 */
function renderPlainTextToCanvas(text, options = {}) {
  const {
    fontSize = 13,
    fontFamily = 'Courier New, Consolas, Monaco, Liberation Mono, monospace',
    lineHeight = 1.4,
    padding = 40,
    background = '#ffffff',
    textColor = '#000000',
    scale = 2
  } = options;

  // Preprocess text: replace tabs with spaces, ensure empty lines render
  const processedText = text
    .replace(/\t/g, '    ')  // Tabs → 4 spaces
    .split('\n')
    .map(line => line.length === 0 ? ' ' : line)  // Empty lines → single space
    .join('\n');

  const lines = processedText.split('\n');
  
  // Check for very long lines (> 200 chars)
  const maxLineLength = Math.max(...lines.map(l => l.length));
  if (maxLineLength > 200) {
    showToast('⚠️ Very wide line detected, canvas may be large', 'is-warning');
  }

  // Create temporary canvas to measure text
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.font = `${fontSize}px ${fontFamily}`;
  
  // Calculate required dimensions by measuring actual text
  let maxWidth = 0;
  lines.forEach(line => {
    const metrics = tempCtx.measureText(line);
    if (metrics.width > maxWidth) {
      maxWidth = metrics.width;
    }
  });
  
  // Calculate canvas size
  const canvasWidth = Math.ceil(maxWidth) + (padding * 2);
  const canvasHeight = Math.ceil(lines.length * fontSize * lineHeight) + (padding * 2);
  
  // Create final canvas (with scale for high DPI)
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth * scale;
  canvas.height = canvasHeight * scale;
  canvas.style.width = canvasWidth + 'px';
  canvas.style.height = canvasHeight + 'px';
  
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  
  // Fill background
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // Configure text rendering
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = textColor;
  ctx.textBaseline = 'top';
  
  // Render each line
  let y = padding;
  lines.forEach(line => {
    ctx.fillText(line, padding, y);
    y += fontSize * lineHeight;
  });
  
  return canvas;
}

/**
 * Render plain text and display in preview area
 * @param {string} text - Raw text content
 */
function renderPlainText(text) {
  try {
    hideError();
    
    if (!text || text.trim().length === 0) {
      showToast('No text to render.', 'is-warning');
      return;
    }
    
    // Get background setting for preview consistency
    const bg = (els.bg.value || '').toLowerCase();
    const background = bg === 'transparent' ? '#ffffff' : bg;
    
    // Render to canvas
    const canvas = renderPlainTextToCanvas(text, {
      fontSize: 13,
      background: background,
      scale: 2
    });
    
    // Convert canvas to data URL and display as image
    const dataUrl = canvas.toDataURL('image/png');
    els.preview.innerHTML = `<img src="${dataUrl}" alt="Plain text preview" style="max-width:100%; border: 1px solid #ddd;">`;
    els.preview.setAttribute('data-engine', 'plaintext');
    
    showToast('Plain text rendered successfully', 'is-success');
  } catch (err) {
    console.error('Plain text rendering error:', err);
    showError(err);
  }
}

/**
 * Export plain text as PNG file
 * @param {string} text - Raw text content
 * @param {Object} settings - Export settings (scale, padding, bg, filename)
 */
function downloadPlainTextPNG(text, settings) {
  try {
    if (!text || text.trim().length === 0) {
      showToast('No text to export. Enter some text first.', 'is-warning');
      return;
    }
    
    // Render to canvas with user settings
    const canvas = renderPlainTextToCanvas(text, {
      fontSize: 13,
      background: settings.bg,
      padding: parseInt(settings.padding) || 16,
      scale: parseInt(settings.scale) || 2
    });
    
    // Convert to blob and download
    canvas.toBlob(blob => {
      if (!blob) {
        showToast('Failed to create PNG. Please try again.', 'is-danger');
        return;
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${settings.filename || 'text'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast(`✓ PNG downloaded: ${a.download}`, 'is-success');
    }, 'image/png');
  } catch (err) {
    console.error('Plain text PNG export failed:', err);
    showToast('PNG export failed. See console for details.', 'is-danger');
  }
}

// ============================================================================
// END PLAIN TEXT RENDERING
// ============================================================================

// Render via Kroki API
async function renderKroki(engineId, code) {
  const engineCfg = DIAGRAM_ENGINES.find(e => e.id === engineId);
  if (!engineCfg || !engineCfg.krokiType) throw new Error('Unsupported engine for Kroki');
  
  // Check session cache first
  const cached = getCachedKrokiSvg(engineId, code);
  if (cached) {
    els.preview.innerHTML = cached;
    els.preview.setAttribute('data-engine', engineId);
    return;
  }
  
  // Check Kroki availability (cached per session)
  const available = await checkKrokiAvailability();
  if (!available) throw new Error('Kroki service unavailable. Check your Kroki base URL or network.');
  
  const res = await krokiRequest(engineCfg.krokiType, 'svg', code, 20000);
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    const hint = res.status >= 500
      ? 'Service is currently unreachable (often a temporary outage). Try again in a few minutes or set a custom Kroki base URL in More options ▸.'
      : 'Check your diagram syntax or try again.';
    const e = new Error(`Kroki render error (${res.status}): ${txt}\n${hint}`);
    throw e;
  }
  const svg = await res.text();
  const sanitized = sanitizeSvg(svg);
  els.preview.innerHTML = sanitized;
  els.preview.setAttribute('data-engine', engineId);
  
  // Cache the result
  setCachedKrokiSvg(engineId, code, sanitized);
}

// Download PNG from Kroki
async function downloadPngFromKroki(engineId, code, filename = 'diagram') {
  const engineCfg = DIAGRAM_ENGINES.find(e => e.id === engineId);
  if (!engineCfg || !engineCfg.krokiType) throw new Error('Unsupported engine for Kroki PNG');
  const res = await krokiRequest(engineCfg.krokiType, 'png', code, 30000);
  if (!res.ok) throw new Error(`Kroki PNG failed: ${res.status}`);
  const blob = await res.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
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
  const selectedEngine = els.diagramType?.value || 'mermaid';
  
  // Plain text doesn't produce SVG
  if (selectedEngine === 'plaintext') {
    showToast('SVG export not available for plain text', 'is-info');
    return;
  }
  
  const svgEl = els.preview.querySelector('svg');
  if (!svgEl) return showToast('Nothing to copy. Render first.', 'is-warning');
  
  // Clone SVG and ensure xmlns attribute exists
  const svgClone = svgEl.cloneNode(true);
  if (!svgClone.hasAttribute('xmlns')) {
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  
  // Use XMLSerializer to get proper XML formatting
  const serializer = new XMLSerializer();
  const svgText = serializer.serializeToString(svgClone);
  
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
    engine: els.diagramType?.value || 'mermaid',
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
  if (cfg.engine && els.diagramType) els.diagramType.value = cfg.engine;
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
  if (els.diagramType) localStorage.setItem(LS_KEYS.diagramEngine, els.diagramType.value);
  if (els.krokiBase) localStorage.setItem(LS_KEYS.krokiBase, els.krokiBase.value);
  if (els.suppressEngineWarning) localStorage.setItem(LS_KEYS.suppressEngineWarning, els.suppressEngineWarning.checked ? '1' : '0');
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

  // restore engine selection (default to mermaid)
  const engine = localStorage.getItem(LS_KEYS.diagramEngine) || 'mermaid';
  if (els.diagramType) els.diagramType.value = engine;
  // restore kroki base
  const krokiBase = localStorage.getItem(LS_KEYS.krokiBase) || '';
  if (els.krokiBase && krokiBase) els.krokiBase.value = krokiBase;
  // restore suppress setting
  const suppress = localStorage.getItem(LS_KEYS.suppressEngineWarning) === '1';
  if (els.suppressEngineWarning) els.suppressEngineWarning.checked = suppress;
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
  // Close dropdown when rebuilding (e.g., when switching engines)
  els.templateDropdown.classList.remove('is-active');
  
  const currentEngine = els.diagramType?.value || 'mermaid';
  const templatesForEngine = TEMPLATES.filter(t => t.engine === currentEngine);
  const categories = [...new Set(templatesForEngine.map(t => t.category))];
  els.templateList.innerHTML = '';
  if (templatesForEngine.length === 0) {
    const noItem = document.createElement('div');
    noItem.className = 'dropdown-item';
    noItem.textContent = `No templates for ${currentEngine}. Try another engine or create your own.`;
    els.templateList.appendChild(noItem);
    return;
  }

  categories.forEach((cat, i) => {
    const catItem = document.createElement('div');
    catItem.className = 'dropdown-item is-category';
    catItem.textContent = cat;
    els.templateList.appendChild(catItem);

    templatesForEngine.filter(t => t.category === cat).forEach(t => {
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

  // Template dropdown trigger (attach once)
  const templateTrigger = els.templateDropdown.querySelector('.dropdown-trigger .button');
  if (templateTrigger) {
    templateTrigger.addEventListener('click', () => toggleDropdown());
  }
  
  // Close dropdown when clicking outside (attach once)
  document.addEventListener('click', (e) => {
    if (!els.templateDropdown.contains(e.target)) {
      toggleDropdown(false);
    }
  });

  els.btnReset.addEventListener('click', resetDefaults);

  els.presetPoster.addEventListener('click', applyPresetPoster);
  els.presetLms.addEventListener('click', applyPresetLms);
  els.presetQuickShare.addEventListener('click', applyPresetQuickShare);

  // Engine selector change
  if (els.diagramType) {
    els.diagramType.addEventListener('change', () => {
      const eng = els.diagramType.value;
      buildTemplateDropdown();
      updateEngineBadge();
      // Option B behavior: keep editor text, warn about syntax differences (unless suppressed)
      const suppressed = els.suppressEngineWarning && els.suppressEngineWarning.checked;
      if (!suppressed) showToast(`${eng} selected — keeping editor text. Syntax may differ between engines.`, 'is-warning');
      
      // Disable direction selector for non-mermaid engines
      if (els.direction) els.direction.disabled = (eng !== 'mermaid');
      
      // Disable theme selector for plaintext engine
      if (els.theme) els.theme.disabled = (eng === 'plaintext');
      
      saveState();
    });
    // ensure initial direction and theme availability
    const initEng = els.diagramType.value || 'mermaid';
    if (els.direction) els.direction.disabled = (initEng !== 'mermaid');
    if (els.theme) els.theme.disabled = (initEng === 'plaintext');
  }

  // Clear Kroki availability cache when base URL changes
  if (els.krokiBase) {
    els.krokiBase.addEventListener('change', () => {
      sessionStorage.removeItem('kroki:available');
      showToast('Kroki base URL updated. Availability will be rechecked.', 'is-info');
      saveState();
    });
  }

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
  updateEngineBadge();
  loadFromHash();
})();

// Engine badge updater
function updateEngineBadge() {
  if (!els.engineBadge || !els.diagramType) return;
  const id = els.diagramType.value || 'mermaid';
  const cfg = DIAGRAM_ENGINES?.find(e => e.id === id);
  els.engineBadge.textContent = cfg?.label || id;
  els.preview.setAttribute('data-engine', id);
}

// SVG sanitization (strip scripts and event handlers)
function sanitizeSvg(svgText) {
  if (!svgText) return '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const svg = doc.documentElement;
    
    // Remove script tags
    const scripts = svg.querySelectorAll('script');
    scripts.forEach(s => s.remove());
    
    // Remove event handler attributes
    const allEls = svg.querySelectorAll('*');
    allEls.forEach(el => {
      const attrs = Array.from(el.attributes);
      attrs.forEach(attr => {
        if (attr.name.startsWith('on')) el.removeAttribute(attr.name);
      });
    });
    
    return new XMLSerializer().serializeToString(svg);
  } catch {
    // If parsing fails, strip <script> tags manually as fallback
    return svgText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
}

// Kroki session cache helpers
function getCachedKrokiSvg(engineId, code) {
  try {
    const key = `kroki:${engineId}:${simpleHash(code)}`;
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;
    const data = JSON.parse(cached);
    const now = Date.now();
    // 5 min TTL
    if (now - data.timestamp > 5 * 60 * 1000) {
      sessionStorage.removeItem(key);
      return null;
    }
    return data.svg;
  } catch {
    return null;
  }
}

function setCachedKrokiSvg(engineId, code, svg) {
  try {
    const key = `kroki:${engineId}:${simpleHash(code)}`;
    const data = { svg, timestamp: Date.now() };
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch {
    // quota exceeded or unavailable, ignore
  }
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // convert to 32bit integer
  }
  return hash.toString(36);
}

// Kroki availability check (cached per session)
async function checkKrokiAvailability() {
  const cacheKey = 'kroki:available';
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) return cached === 'true';
  
  try {
    // Try a minimal PlantUML diagram as health check with fallbacks
    const testCode = '@startuml\nA -> B\n@enduml';
    const res = await krokiRequest('plantuml', 'svg', testCode, 5000);
    const available = !!res && res.ok;
    sessionStorage.setItem(cacheKey, available ? 'true' : 'false');
    return available;
  } catch {
    sessionStorage.setItem(cacheKey, 'false');
    return false;
  }
}
