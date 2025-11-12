# Canvas-Based Text→PNG Converter Implementation Plan

**Date**: November 12, 2025  
**Purpose**: Add plain text rendering capability to the multi-engine diagram converter for preserving ASCII art layouts (like test.txt) when converting to PNG

---

## Problem Statement

**Current Issue**:
- User has text files with ASCII diagrams + HTML code examples (test.txt)
- Need to convert to PNG to preserve layout across different screen sizes
- Existing engines (svgbob, ditaa) don't handle text-heavy content well
- HTML tags in content break `<pre>` rendering in browsers
- Need client-side solution compatible with GitHub Pages deployment

**Requirements**:
- ✅ Preserve exact character positioning (monospace layout)
- ✅ Handle HTML tags as literal text (no parsing/rendering)
- ✅ Support Unicode box-drawing characters (┌─┐│└┘├┤)
- ✅ Work entirely client-side (no backend)
- ✅ Export to high-quality PNG
- ✅ Integrate with existing export pipeline

---

## Proposed Solution

Add a new "Plain Text" engine that renders textarea content directly to Canvas using monospace font, then exports to PNG using existing download logic.

**Why Canvas API:**
- Already using Canvas for Mermaid PNG export (proven, working)
- `ctx.fillText()` treats HTML as plain text (no parsing)
- Zero additional dependencies
- Instant rendering (no network calls)
- Full control over fonts, spacing, colors

---

## Implementation Design

### 1. New Engine Addition

**Add to `data.js`:**
```javascript
const DIAGRAM_ENGINES = [
  { id: 'mermaid', label: 'Mermaid ⚡', clientSide: true },
  { id: 'plaintext', label: 'Plain Text 📝', clientSide: true }, // NEW
  { id: 'plantuml', label: 'PlantUML 🌐', clientSide: false, krokiType: 'plantuml' },
  // ... rest of engines
];
```

**Template (optional):**
```javascript
{ 
  key: 'plaintext_ascii', 
  label: 'ASCII Documentation', 
  category: 'Process & Flow', 
  engine: 'plaintext', 
  code: `Example ASCII diagram with box characters...` 
}
```

**Engine selector in `index.html`:**
```html
<option value="plaintext">Plain Text 📝</option>
```

---

### 2. Core Rendering Function

**Add to `app.js` (after existing render functions):**

```javascript
/**
 * Render plain text to canvas with monospace font
 * @param {string} text - Raw text content
 * @param {Object} options - Rendering options
 * @returns {HTMLCanvasElement} - Canvas with rendered text
 */
function renderPlainTextToCanvas(text, options = {}) {
  const {
    fontSize = 13,           // Match typical code editor size
    fontFamily = 'Courier New, Consolas, Monaco, monospace',
    lineHeight = 1.4,        // Comfortable reading spacing
    padding = 40,            // Border space
    background = '#ffffff',  // White background (configurable)
    textColor = '#000000',   // Black text
    scale = 2                // Retina/high-DPI support
  } = options;

  // Split text into lines
  const lines = text.split('\n');
  
  // Create temporary canvas for measurement
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.font = `${fontSize}px ${fontFamily}`;
  
  // Calculate required dimensions
  // Use widest line to determine canvas width
  let maxWidth = 0;
  lines.forEach(line => {
    const width = tempCtx.measureText(line).width;
    if (width > maxWidth) maxWidth = width;
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
```

**Key Design Decisions:**
- **Font measurement**: Use `measureText()` to calculate exact width per line
- **High DPI**: Scale canvas 2x for crisp rendering on retina displays
- **Box characters**: Native browser font rendering handles Unicode
- **HTML safety**: `fillText()` renders text literally, no HTML parsing

---

### 3. Integration with Render Pipeline

**Modify `renderDiagram()` function:**

```javascript
async function renderDiagram() {
  const text = els.input.value.trim();
  const engineId = els.diagramType.value;
  
  // ... existing validation ...
  
  // Route to appropriate renderer
  const engine = DIAGRAM_ENGINES.find(e => e.id === engineId);
  
  if (engineId === 'mermaid') {
    // Existing Mermaid logic
    await renderMermaid(text);
  } else if (engineId === 'plaintext') {
    // NEW: Plain text rendering
    renderPlainText(text);
  } else if (!engine.clientSide) {
    // Existing Kroki logic
    await renderKroki(engineId, text);
  }
  
  saveState();
  updateEngineBadge();
}

/**
 * Render plain text and display in preview
 */
function renderPlainText(text) {
  try {
    hideError();
    
    // Get export settings for consistency
    const exportSettings = loadExportSettings();
    
    // Render to canvas
    const canvas = renderPlainTextToCanvas(text, {
      fontSize: 13,
      background: exportSettings.bg === 'transparent' ? '#ffffff' : exportSettings.bg,
      scale: 2
    });
    
    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/png');
    
    // Display in preview as image
    els.preview.innerHTML = `<img src="${dataUrl}" alt="Plain text preview" style="max-width:100%;">`;
    
    showToast('Plain text rendered successfully', 'is-success');
  } catch (err) {
    showError(err);
  }
}
```

**Why this approach:**
- Follows existing pattern (mermaid vs kroki branching)
- Reuses export settings (background color)
- Preview shows rendered image (consistent with other engines)

---

### 4. PNG Export Integration

**Modify `downloadPNG()` function:**

```javascript
async function downloadPNG() {
  const engineId = els.diagramType.value;
  const text = els.input.value.trim();
  const exportSettings = loadExportSettings();
  
  // Route based on engine
  if (engineId === 'mermaid') {
    // Existing Mermaid PNG export
    await downloadMermaidPNG();
  } else if (engineId === 'plaintext') {
    // NEW: Plain text PNG export
    downloadPlainTextPNG(text, exportSettings);
  } else {
    // Existing Kroki PNG export
    await downloadPngFromKroki(engineId, text, exportSettings.filename);
  }
}

/**
 * Export plain text as PNG file
 */
function downloadPlainTextPNG(text, settings) {
  try {
    // Render to canvas with user settings
    const canvas = renderPlainTextToCanvas(text, {
      fontSize: 13,
      background: settings.bg,
      padding: parseInt(settings.padding) || 16,
      scale: parseInt(settings.scale) || 2
    });
    
    // Convert to blob and download
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${settings.filename || 'text'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast(`PNG downloaded: ${a.download}`, 'is-success');
    }, 'image/png');
  } catch (err) {
    console.error('Plain text PNG export failed:', err);
    showToast('PNG export failed. See console for details.', 'is-danger');
  }
}
```

**Why this approach:**
- Reuses existing `downloadPNG()` routing pattern
- Respects user export settings (scale, padding, background)
- Uses proven blob download mechanism

---

### 5. SVG Export (Optional Future Enhancement)

Plain text doesn't naturally produce SVG, but we could:
- Generate SVG with `<text>` elements (one per line)
- Wrap in `<svg>` with proper viewBox
- Allow SVG download for vector scaling

**Deferred for now** — focus on PNG first.

---

### 6. UI Updates

**No major UI changes needed:**
- Engine selector dropdown: Add "Plain Text 📝" option ✓
- Template dropdown: Filters automatically by engine ✓
- Preview: Shows canvas-rendered image ✓
- Export buttons: Work as-is (route by engine) ✓
- Settings: Scale/padding/background already apply ✓

**Optional enhancements:**
- Disable "Direction" selector for plaintext (like we do for non-Mermaid engines)
- Disable "Theme" selector (not applicable to plain text)
- Add tooltip: "Use Plain Text for ASCII diagrams with code examples"

---

### 7. Direction/Theme Handling

**Modify `bindEvents()` to disable irrelevant controls:**

```javascript
// In engine change handler
els.diagramType.addEventListener('change', () => {
  const engine = DIAGRAM_ENGINES.find(e => e.id === els.diagramType.value);
  
  // Disable direction for non-Mermaid engines
  els.direction.disabled = engine.id !== 'mermaid';
  
  // NEW: Disable theme for plaintext
  els.theme.disabled = engine.id === 'plaintext';
  
  buildTemplateDropdown();
  updateEngineBadge();
  // ... existing toast logic
});
```

---

## Edge Cases & Considerations

### 1. **Empty Lines**
- **Issue**: Canvas might collapse empty lines
- **Solution**: Replace empty lines with single space character before rendering

### 2. **Very Long Lines**
- **Issue**: Lines exceeding ~200 characters might create huge canvas
- **Solution**: Canvas will auto-size; consider showing warning if width > 2000px

### 3. **Very Large Files**
- **Issue**: 500+ line files create tall canvases (memory)
- **Solution**: Canvas can handle this; browser limits ~32k px height (unlikely to hit)

### 4. **Font Availability**
- **Issue**: "Courier New" might not exist on all systems
- **Solution**: Font-family fallback chain: `'Courier New', Consolas, Monaco, 'Liberation Mono', monospace`

### 5. **Unicode Box Characters**
- **Issue**: Some fonts don't render ┌─┐│└┘ correctly
- **Solution**: Test on load; primary monospace fonts (Courier, Consolas) support Unicode box drawing

### 6. **Copy SVG Button**
- **Issue**: Plain text doesn't produce SVG
- **Solution**: Either:
  - Disable "Copy SVG" button when plaintext selected
  - Generate SVG with `<text>` elements (more complex)
  - Leave as-is and show "Not available for plain text" toast

### 7. **Permalink**
- **Issue**: Permalink should include engine='plaintext'
- **Solution**: Already handled by existing permalink logic (includes diagramEngine)

---

## Testing Plan

### Unit Tests (Manual)
1. ✅ Empty input → Should show validation error
2. ✅ Short text (5 lines) → Renders correctly
3. ✅ test.txt (full file) → All box characters render, HTML tags show as text
4. ✅ Very long line (200+ chars) → Canvas auto-sizes correctly
5. ✅ Unicode characters (emoji, symbols) → Renders correctly
6. ✅ Tab characters → Converted to spaces or renders as-is
7. ✅ CRLF line endings (Windows) → Splits correctly
8. ✅ Transparent background → PNG has transparency
9. ✅ Scale factor 1-4 → Different resolutions export correctly
10. ✅ Custom padding (0, 16, 50) → Affects canvas size

### Integration Tests
1. ✅ Switch from Mermaid → Plain Text → renders correctly
2. ✅ Switch from Plain Text → PlantUML → doesn't break Kroki
3. ✅ Template dropdown filters by plaintext engine
4. ✅ Permalink with plaintext engine → loads correctly
5. ✅ Export settings (scale/padding/bg) → apply to plaintext PNG
6. ✅ localStorage persistence → engine selection saved

### Browser Compatibility
- ✅ Chrome/Edge (Blink): Primary target
- ✅ Firefox (Gecko): Test font rendering
- ✅ Safari (WebKit): Test Canvas toBlob

---

## Files to Modify

| File | Changes | Lines Added |
|------|---------|-------------|
| `data.js` | Add plaintext engine + optional template | ~15 |
| `index.html` | Add `<option>` for plaintext | ~1 |
| `app.js` | Add `renderPlainTextToCanvas()`, `renderPlainText()`, `downloadPlainTextPNG()`, modify routing logic | ~120 |
| **Total** | | **~136 lines** |

---

## Documentation Updates

After implementation:
- ✅ Update `README.md`: 15 engines (add Plain Text to "Client-Side Rendering" table)
- ✅ Update `logs/project-context.md`: Engine count, template count, add Plain Text to architecture flow
- ✅ Update `logs/prompts.md`: Update counts in all prompt templates
- ✅ Add usage note: "Plain Text engine for ASCII diagrams and code examples"

---

## Rollout Plan

### Phase 1: Core Implementation ✅
1. Add plaintext engine to data.js
2. Add option to index.html
3. Implement renderPlainTextToCanvas()
4. Implement renderPlainText() (preview)
5. Implement downloadPlainTextPNG() (export)
6. Add routing in renderDiagram() and downloadPNG()

### Phase 2: Polish ✅
7. Disable theme selector for plaintext
8. Test with test.txt (real-world validation)
9. Handle "Copy SVG" button (disable or show toast)
10. Add template (optional)

### Phase 3: Documentation ✅
11. Update README.md
12. Update project-context.md
13. Update prompts.md

---

## Alternative Approaches Considered

### ❌ PyScript/Pyodide + Pillow
- **Rejected**: 40 MB download, 3-5s startup, added complexity
- **Why**: Canvas API achieves same result with zero dependencies

### ❌ Server-side rendering
- **Rejected**: Requires backend, breaks GitHub Pages deployment
- **Why**: Must remain client-side only

### ❌ SVG with `<text>` elements
- **Considered**: Generate SVG instead of Canvas
- **Deferred**: Canvas→PNG is simpler; SVG text positioning tricky for monospace
- **Future**: Could add as enhancement

### ❌ WebGL for rendering
- **Rejected**: Overkill for static text rendering
- **Why**: Canvas 2D is simpler and sufficient

---

## Success Criteria

✅ User can paste test.txt content  
✅ Select "Plain Text 📝" engine  
✅ Preview shows rendered text with correct layout  
✅ Box-drawing characters (┌─┐│└┘) render correctly  
✅ HTML tags display as literal text (not parsed)  
✅ Download PNG produces high-quality image  
✅ Export settings (scale, padding, bg) work correctly  
✅ No additional dependencies required  
✅ Works on GitHub Pages  
✅ Integration doesn't break existing engines  

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Font rendering issues | Low | Medium | Use common monospace fonts with fallbacks |
| Canvas size limits | Very Low | Low | Unlikely to hit 32k px limit with text |
| Unicode character gaps | Low | Medium | Test with sample content; primary fonts support box chars |
| Performance on large files | Low | Low | Canvas is fast; 1000+ lines still renders <1s |
| Breaking existing engines | Low | High | Add as new branch, don't modify existing logic |

---

## Future Enhancements

**Deferred to later:**
- 📋 SVG export (generate `<text>` elements)
- 🎨 Syntax highlighting (detect code blocks, apply colors)
- 📏 Font size picker (user-adjustable)
- 🌈 Color themes (light/dark/high-contrast)
- 📦 Custom font upload (for specialized Unicode needs)
- 🔄 Auto-detect engine (if content has HTML tags + box chars → suggest plaintext)

---

## Open Questions & Clarifications Needed

### 1. **Engine Naming**
- ✅ Proposed: "Plain Text 📝"
- Alternatives: "Text Renderer", "ASCII Diagram", "Raw Text"
- **Question**: Do you prefer a different name?

### 2. **Template**
- Should we include a plaintext template? If yes:
  - Option A: Copy of test.txt (HTML form structure)
  - Option B: Generic ASCII box example
  - Option C: No template (users paste their own)
- **Question**: Which option, or skip template for now?

### 3. **Copy SVG Button Behavior**
- Option A: Disable button when plaintext selected
- Option B: Show toast "SVG not available for plain text"
- Option C: Generate SVG with `<text>` elements (more work)
- **Question**: Which approach?

### 4. **Theme/Direction Controls**
- Should theme selector be:
  - Option A: Disabled (grayed out)
  - Option B: Hidden completely
  - Option C: Left enabled but ignored
- **Question**: Preference?

### 5. **Default Font Size**
- Proposed: 13px (matches typical code editors)
- Alternatives: 12px (denser), 14px (more readable)
- **Question**: Should this be user-configurable (new setting) or hardcoded?

### 6. **Line Height**
- Proposed: 1.4 (comfortable spacing)
- Alternatives: 1.3 (denser), 1.5 (more spacious)
- **Question**: Fixed or user-configurable?

### 7. **Maximum Canvas Size**
- Should we add a safety check?
  - Option A: No limit (trust browser)
  - Option B: Warn if width > 2000px or height > 5000px
  - Option C: Hard limit and truncate
- **Question**: Add checks or trust browser limits?

---

## Feasibility Assessment

### ✅ **HIGH CONFIDENCE** — Recommended to Proceed

**Reasons:**
1. ✅ Canvas API is proven (already using for Mermaid PNG)
2. ✅ No new dependencies (everything in browser)
3. ✅ Low code footprint (~136 lines)
4. ✅ Follows existing architecture patterns
5. ✅ Low risk of breaking existing engines
6. ✅ Solves real user need (test.txt conversion)
7. ✅ Fast implementation (~2-3 hours work)

**Recommendation**: **PROCEED** with implementation after clarifying open questions above.

---

**Next Steps:**
1. Answer open questions 1-7
2. Confirm plan approval
3. Begin Phase 1 implementation
4. Test with test.txt
5. Update documentation

---

**Plan Status**: ✅ **READY FOR REVIEW**  
**Estimated Implementation Time**: 2-3 hours  
**Risk Level**: 🟢 **LOW**
