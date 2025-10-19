# Mermaid Diagram Converter - Project Context

> **Purpose**: This document provides comprehensive technical context for AI assistants working on this project. It covers architecture, patterns, known issues, and important implementation details.

---

## Project Overview

**Name**: Mermaid → Image Converter  
**Type**: Single-page web application (vanilla JavaScript)  
**Purpose**: Convert Mermaid diagram code to SVG and PNG images with export controls

**Core Features**:
- Live Mermaid diagram rendering with theme support
- Template library with 9 curated diagram types
- SVG and PNG export with quality controls (scale, padding, background)
- Clipboard operations (copy SVG, copy permalink)
- LocalStorage persistence (diagram text, settings, last template)
- Export presets (Poster mode, LMS mode, Quick share)
- Friendly error hints for common Mermaid syntax issues

**Tech Stack**:
- Vanilla JavaScript (ES6+, no frameworks)
- Mermaid v10.9.4 (diagram rendering)
- Canvg v3.0.1 (SVG-to-Canvas fallback for PNG export)
- Bulma v0.9.4 (CSS framework for UI)
- All processing happens client-side (no backend)

---

## File Structure

```
mermaid_diagrams/
├── index.html          # UI structure, CDN imports, layout
├── app.js              # All application logic (render, export, state, events)
├── data.js             # Template definitions (TEMPLATES array)
├── style.css           # Minimal custom styles (preview box, dropdown categories)
├── logs/               # Project documentation (this file + prompts.md)
└── archive/            # Backup of earlier versions (not actively used)
```

**File Roles**:
- **index.html**: Defines the UI layout (editor column, preview column, settings, buttons). Loads Mermaid, Canvg, Bulma CSS, then data.js and app.js.
- **app.js**: Contains all JavaScript logic (~550 lines). Handles rendering, exports (SVG/PNG), localStorage state, template dropdown, error handling, presets, and event bindings.
- **data.js**: Stores the `TEMPLATES` array—a list of curated Mermaid diagram examples organized by category. Kept separate for easy template management.
- **style.css**: Adds minor styling (preview wrapper borders, dropdown category headers, toast positioning).

---

## Dependencies

External libraries loaded via CDN:

**Mermaid v10.9.4** (diagram rendering engine)
- CDN: `https://cdn.jsdelivr.net/npm/mermaid@10.9.4/dist/mermaid.min.js`
- **Why pinned**: Generic `@10` was causing mindmap parser hangs and instability. Version 10.9.4 is tested and stable for core diagram types.
- Initialized with: `startOnLoad: false`, `securityLevel: 'strict'`, `htmlLabels: true`

**Canvg v3.0.1** (SVG-to-Canvas conversion library)
- CDN: `https://cdn.jsdelivr.net/npm/canvg@3.0.1/lib/umd.js`
- **Purpose**: Fallback for PNG export when native browser SVG rendering fails
- Detection logic handles multiple UMD global variants: `window.canvg`, `window.Canvg`, `canvg.Canvg`

**Bulma CSS v0.9.4** (UI framework)
- CDN: `https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css`
- Provides layout grid, buttons, form controls, notifications, dropdowns

---

## Browser Requirements

**Minimum requirements**:
- Modern browser with ES6+ support (async/await, template literals, arrow functions)
- Required Web APIs:
  - `navigator.clipboard` (Copy SVG, Copy Permalink features)
  - `localStorage` (state persistence across sessions)
  - `Canvas API` (PNG export rendering)
  - `DOMParser` (SVG manipulation for padding/background)
  - `Blob` and `URL.createObjectURL` (file download triggers)

**Known limitations**:
- **Clipboard API**: Requires HTTPS or localhost (won't work on plain HTTP in production)
- **localStorage**: ~5-10MB limit per origin (diagram text, theme, export settings stored here)
- **SVG rendering**: Some older browsers may have issues with complex SVG filters or foreignObject elements

---

## Architecture & Data Flow

**Rendering flow**:
1. User enters Mermaid code in textarea (or selects template)
2. `renderDiagram()` is called (button click or Ctrl/Cmd+Enter)
3. Direction injection: if user selected TB/LR/etc., inject it into flowchart syntax
4. `mermaid.initialize()` called with current theme and settings
5. `mermaid.render('mermaid-svg-id', text)` generates SVG string
6. SVG inserted into preview div
7. On success: `saveState()` persists to localStorage
8. On error: `showError(e)` displays friendly hint + raw error message

**Export flow (PNG)**:
1. User clicks "Download PNG"
2. `downloadPNG()` retrieves rendered SVG from preview
3. Apply padding and background via `addPaddingToSVG()` (modifies viewBox or adds background rect)
4. Compute target dimensions with scale factor
5. **Native rendering** (preferred):
   - Convert SVG to Blob URL
   - Load into `Image` element
   - Draw to canvas with `ctx.drawImage()`
   - Benefits: crisp text, better font rendering
6. **Canvg fallback** (if native fails):
   - Use Canvg to parse and render SVG to canvas
   - Handles edge cases but can have text quality issues
7. Convert canvas to PNG via `canvas.toDataURL('image/png')`
8. Trigger download with temporary `<a>` element

**State persistence**:
- Uses `localStorage` with namespaced keys (prefix `mmd.`)
- Saved on every render and settings change
- Restored on page load via `restoreState()`

---

## Key Code Patterns

**localStorage keys** (defined in `LS_KEYS` object):
```javascript
const LS_KEYS = {
  diagramText: 'mmd.diagramText',      // Textarea content
  theme: 'mmd.theme',                  // Selected Mermaid theme
  direction: 'mmd.direction',          // Flowchart direction override
  export: 'mmd.export',                // JSON: {scale, bg, padding, filename}
  lastTemplateKey: 'mmd.lastTemplateKey'  // Last selected template
};
```
- Prefix `mmd.` prevents collisions with other apps on same origin
- Export settings stored as JSON string

**Template structure** (in `data.js`):
```javascript
const TEMPLATES = [
  { 
    key: 'flowchart_td',              // Unique identifier
    label: 'Flowchart (Top-Down)',    // Display name in dropdown
    category: 'Core',                 // Groups templates in dropdown
    code: `flowchart TD ...`          // Mermaid diagram code (template literal)
  },
  // ... more templates
];
```
- Categories: "Core", "Software & Systems", "Planning"
- Dropdown builder groups by category with dividers
- Clicking a template populates textarea and auto-renders

**Element references** (defined in `els` object):
All DOM elements cached at initialization for performance:
```javascript
const els = {
  input: document.getElementById('mmd-input'),
  preview: document.getElementById('preview'),
  btnDownloadPng: document.getElementById('btn-download-png'),
  // ... ~28 total elements
};
```

**Error handling with hints**:
```javascript
function makeFriendlyHint(raw) {
  const lower = (raw || '').toLowerCase();
  if (lower.includes('lexical') || lower.includes('parse')) {
    return 'Tip: Start with a diagram type (e.g., "graph TD", "flowchart LR", "sequenceDiagram"). Check arrows and colons.';
  }
  // ... more pattern matching
  return 'Something went wrong rendering your diagram. Check the first line and overall syntax.';
}
```
- Converts cryptic Mermaid errors into actionable hints
- Displayed in red error box with toggle for raw error details

---

## Export Pipeline Deep Dive

**Why native SVG-to-Canvas rendering is preferred**:
- Browser's native `drawImage()` preserves font hinting and subpixel rendering
- Results in crisp, readable text in exported PNGs
- Faster than parsing SVG with a library

**When Canvg fallback is used**:
- If native blob URL creation fails
- If Image loading fails (security errors, CORS issues)
- If SVG contains unsupported elements for native rendering

**Padding implementation**:
```javascript
function addPaddingToSVG(svgText, padding, bg) {
  // Parses SVG, expands viewBox by padding amount
  // If background specified, inserts <rect> at start
  // Returns modified SVG string
}
```
- Modifies viewBox coordinates: `minX - padding, minY - padding, width + 2*padding, height + 2*padding`
- Background rect uses 100% width/height to fill viewBox
- Falls back to adding padding to width/height attributes if no viewBox

**Scale factor**:
- User sets scale (1-4, default 2)
- Canvas dimensions = SVG dimensions × scale
- Higher scale = sharper PNG but larger file size
- PNG exports at `scale × original size` then gets viewed at 100%, appearing crisp

---

## Known Issues & Workarounds

**1. Mindmap diagrams cause page hang**
- **Issue**: Mermaid's mindmap parser in v10.x can enter infinite loop with certain syntax (e.g., `root((Mars))` with styled nodes)
- **Workaround**: Removed mindmap template from dropdown (Oct 2025)
- **Safe mindmap syntax** (if users write their own):
  - Use plain text nodes without parentheses/shape syntax
  - Avoid colons and special characters in node labels
  - Keep hierarchy via indentation only
- **Future**: May re-add template if Mermaid version is upgraded with parser fixes

**2. Kanban diagram template errors**
- **Issue**: "kanban" is not an official Mermaid diagram type in v10
- **Workaround**: Removed kanban template from dropdown (Oct 2025)
- **Alternative**: Could mock kanban layout with flowchart columns if needed

**3. PNG export had blurry text**
- **Issue**: Initial implementation used Canvg for all PNG exports, which doesn't render text as crisply as native browser rendering
- **Fix**: Switched to native SVG → Image → Canvas pipeline (Oct 2025)
- **Result**: Text in PNGs now matches SVG quality

**4. Download PNG button was unresponsive**
- **Issue**: Original code had incorrect Canvg global detection and no error handling
- **Fix**: Added robust UMD global detection (`window.canvg`, `window.Canvg`, `canvg.Canvg`) and wrapped in try/catch with user toast feedback
- **Result**: Button now works reliably and shows errors if export fails

**5. Direction selector doesn't affect all diagram types**
- **Limitation**: Direction injection (`injectDirection()`) only works for flowchart/graph types
- **Expected**: Sequence diagrams, ER diagrams, etc. ignore direction setting
- **Not a bug**: This is by design; direction is flowchart-specific

---

## Template System

**How templates work**:
1. `data.js` exports `TEMPLATES` array to global scope
2. `app.js` reads `TEMPLATES` on initialization
3. `buildTemplateDropdown()` groups by category and creates dropdown items
4. Each template click: sets textarea value, saves to localStorage, calls `renderDiagram()`

**Adding a new template**:
1. Edit `data.js`
2. Add object to `TEMPLATES` array:
   ```javascript
   { 
     key: 'unique_key',           // Use snake_case
     label: 'Display Name',       // Shown in dropdown
     category: 'Core',            // 'Core', 'Software & Systems', or 'Planning'
     code: `diagram type\n  ...`  // Mermaid code
   }
   ```
3. Refresh page; new template appears in dropdown under its category

**Template categories** (current):
- **Core**: Basic diagram types (flowchart, sequence, class, state)
- **Software & Systems**: Git graph, ER diagram
- **Planning**: Gantt, timeline

**Removed templates** (and why):
- **Kanban**: Not a supported Mermaid type
- **Mindmap**: Parser instability causing page hangs

---

## Common Pitfalls

**Mermaid syntax quirks**:
- **Flowchart edge labels**: Must be between dashes: `A -- label --> B`, not `A --> B label`
- **Colons in non-sequence diagrams**: Can confuse parser; quote labels if they contain colons
- **Parentheses in mindmap**: Avoid `(...)` shape syntax; use plain text nodes
- **Direction must match diagram**: Injecting `LR` into a sequence diagram has no effect

**localStorage limits**:
- ~5-10MB total per origin (varies by browser)
- Large diagrams (>1000 nodes) may hit limits
- If quota exceeded, `saveState()` fails silently (no error handling currently)
- Consider adding try/catch around `localStorage.setItem` if users report state loss

**Clipboard API restrictions**:
- Requires user gesture (click) to write to clipboard
- Requires HTTPS or localhost
- Some browsers prompt user for permission
- If clipboard write fails, error toast is shown but no retry mechanism

**Permalink encoding**:
- Uses Base64 encoding of JSON payload: `btoa(unescape(encodeURIComponent(JSON.stringify(payload))))`
- Large diagrams create very long URLs (some browsers/servers have URL length limits ~2000 chars)
- No URL shortening implemented

---

## Future Considerations

**Potential improvements**:
1. **Timeout for render**: Add a timer to detect stuck Mermaid renders and show "Taking too long, diagram may be invalid" warning
2. **localStorage quota handling**: Catch quota exceeded errors and prompt user to clear old data
3. **Template search/filter**: If template library grows beyond 15-20 items, add search box
4. **Export to other formats**: PDF (via jsPDF), JPEG, WebP
5. **Diagram validation**: Pre-parse check before sending to Mermaid to catch common errors early
6. **Collaborative features**: URL-based sharing with short links (requires backend)
7. **Offline support**: Service worker for PWA functionality
8. **Dark mode UI**: Currently only affects diagram rendering, not app UI
9. **Undo/redo**: History stack for textarea edits
10. **Keyboard shortcuts**: Beyond Ctrl+Enter for render (e.g., Ctrl+S for download SVG)

**Monitoring/debugging additions**:
- Console logging of render time (performance tracking)
- Error reporting to external service (Sentry, etc.)
- Analytics for template usage and export format popularity

**Accessibility**:
- Current state: Basic keyboard navigation works, but no ARIA labels or screen reader optimization
- Could add: Better focus management, announced state changes, high-contrast mode

---

## Quick Reference

**Important functions** (all in `app.js`):
- `renderDiagram()` - Main render entry point
- `downloadSVG()` - SVG export
- `downloadPNG()` - PNG export with native/Canvg logic
- `saveState()` / `restoreState()` - localStorage persistence
- `buildTemplateDropdown()` - Populates template menu
- `makeFriendlyHint()` - Error message translation

**Initialization order**:
1. `restoreState()` - Load saved settings and diagram
2. `initMermaid()` - Configure Mermaid with theme
3. `bindEvents()` - Attach click handlers, keyboard shortcuts
4. `buildTemplateDropdown()` - Create template menu
5. `loadFromHash()` - If permalink in URL, load and render

**Event listeners**:
- Render: button click, Ctrl/Cmd+Enter
- Theme/direction change: auto-render on dropdown change
- Export buttons: click to download
- Advanced panel: toggle visibility
- Presets: apply settings but don't auto-download

---

**Last Updated**: October 19, 2025  
**Mermaid Version**: 10.9.4 (pinned)  
**Status**: Stable, production-ready for core diagram types
