# Mermaid Diagram Converter - Project Context

> **Purpose**: This document provides comprehensive technical context for AI assistants working on this project. It covers architecture, patterns, known issues, and important implementation details.

---

## Project Overview

**Name**: Multi-Engine Diagram Converter (formerly Mermaid → Image Converter)  
**Type**: Single-page web application (vanilla JavaScript)  
**Purpose**: Convert diagram code to SVG and PNG images with support for multiple diagram engines

**Core Features**:
- **Multi-engine support**: Mermaid (client-side) plus Kroki-backed engines: PlantUML, Graphviz, D2, Svgbob, Ditaa, Nomnoml, Seqdiag, Actdiag, Nwdiag, Rackdiag, ERD (Kroki), Bytefield, Packetdiag
- Live diagram rendering with engine selector and theme support
- Template library with 30 curated diagram types across 14 engines
- SVG and PNG export with quality controls (scale, padding, background)
- Hybrid export: Native rendering for Mermaid, Kroki API for remote engines
- Clipboard operations (copy SVG, copy permalink)
- LocalStorage persistence (diagram text, settings, engine, last template)
- Export presets (Poster mode, LMS mode, Quick share)
- Friendly error hints for common syntax issues
- Session caching for Kroki responses (performance optimization)
- SVG sanitization for security (strips scripts and event handlers)
- Configurable Kroki base URL (supports self-hosting)

**Tech Stack**:
- Vanilla JavaScript (ES6+, no frameworks)
- Mermaid v10.9.4 (client-side diagram rendering)
- Kroki API (remote rendering for PlantUML, Graphviz, D2)
- Canvg v3.0.1 (SVG-to-Canvas fallback for PNG export)
- Bulma v0.9.4 (CSS framework for UI)
- Hybrid architecture: Mermaid client-side, other engines via Kroki POST requests

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

**Multi-engine architecture**:
```
User Input → [Engine Selector] → Router
                                    ↓
                    ┌───────────────┴──────────────┐
                    ↓                              ↓
            Mermaid.render()              Kroki API (POST)
            (client-side)                 (PlantUML/Graphviz/D2)
                    ↓                              ↓
                   SVG ←──────────────────────── SVG (sanitized)
                    ↓
          Session Cache (5min TTL)
                    ↓
                 Preview
                    ↓
          PNG Export (hybrid approach)
```

**Rendering flow (Mermaid)**:
1. User enters Mermaid code in textarea (or selects template)
2. `renderDiagram()` checks selected engine
3. For Mermaid engine:
   - Direction injection: if user selected TB/LR/etc., inject it into flowchart syntax
   - `mermaid.initialize()` called with current theme and settings
   - `mermaid.render('mermaid-svg-id', text)` generates SVG string
   - SVG inserted into preview div
4. On success: `saveState()` persists to localStorage
5. On error: `showError(e)` displays friendly hint + raw error message

**Rendering flow (Kroki engines)**:
1. User selects PlantUML/Graphviz/D2 engine and enters code
2. `renderDiagram()` routes to `renderKroki(engineId, code)`
3. Check session cache: if diagram cached (by engine + code hash), use cached SVG
4. Check Kroki availability: one-time health check per session
5. POST diagram code to `${krokiBase}/${engineType}/svg` (20s timeout)
6. Sanitize response SVG: strip `<script>` tags and `on*` event attributes
7. Insert sanitized SVG into preview
8. Cache result in sessionStorage with 5min TTL
9. On error: display Kroki-specific error message with HTTP status

**Export flow (PNG - Mermaid)**:
1. User clicks "Download PNG"
2. `downloadPNG()` checks selected engine
3. For Mermaid: retrieve rendered SVG from preview
4. Apply padding and background via `addPaddingToSVG()` (modifies viewBox or adds background rect)
5. Compute target dimensions with scale factor
6. **Native rendering** (preferred):
   - Convert SVG to Blob URL
   - Load into `Image` element
   - Draw to canvas with `ctx.drawImage()`
   - Benefits: crisp text, better font rendering
7. **Canvg fallback** (if native fails):
   - Use Canvg to parse and render SVG to canvas
   - Handles edge cases but can have text quality issues
8. Convert canvas to PNG via `canvas.toDataURL('image/png')`
9. Trigger download with temporary `<a>` element

**Export flow (PNG - Kroki engines)**:
1. User clicks "Download PNG" with PlantUML/Graphviz/D2 selected
2. `downloadPNG()` routes to `downloadPngFromKroki(engineId, code, filename)`
3. POST diagram code to `${krokiBase}/${engineType}/png` (30s timeout)
4. Receive binary PNG blob from Kroki
5. Create download link and trigger via temporary `<a>` element
6. Benefits: Server-side rendering with consistent quality, no canvas conversion needed

**State persistence**:
- Uses `localStorage` with namespaced keys (prefix `mmd.`)
- Saved on every render and settings change
- Restored on page load via `restoreState()`

---

## Key Code Patterns

**localStorage keys** (defined in `LS_KEYS` object):
```javascript
const LS_KEYS = {
  diagramText: 'mmd.diagramText',               // Textarea content
  theme: 'mmd.theme',                           // Selected Mermaid theme
  direction: 'mmd.direction',                   // Flowchart direction override
  export: 'mmd.export',                         // JSON: {scale, bg, padding, filename}
  lastTemplateKey: 'mmd.lastTemplateKey',       // Last selected template
  diagramEngine: 'mmd.diagramEngine',           // Selected engine (mermaid/plantuml/graphviz/d2)
  krokiBase: 'mmd.krokiBase',                   // Custom Kroki base URL (optional)
  suppressEngineWarning: 'mmd.suppressEngineWarning'  // '1' = hide engine switch toast
};
```
- Prefix `mmd.` prevents collisions with other apps on same origin
- Export settings stored as JSON string
- Engine defaults to 'mermaid' if not set

**sessionStorage keys** (runtime cache):
```javascript
// Kroki SVG cache: `kroki:${engineId}:${hash(code)}`
// Structure: { svg: string, timestamp: number }
// TTL: 5 minutes

// Kroki availability: 'kroki:available'
// Values: 'true' or 'false'
// Cached per session to avoid repeated health checks
```

**Engine configuration** (in `data.js`, excerpt):
```javascript
const DIAGRAM_ENGINES = [
  { id: 'mermaid', label: 'Mermaid ⚡', clientSide: true },
  { id: 'plantuml', label: 'PlantUML 🌐', clientSide: false, krokiType: 'plantuml' },
  { id: 'graphviz', label: 'Graphviz 🌐', clientSide: false, krokiType: 'graphviz' },
  { id: 'd2', label: 'D2 🌐', clientSide: false, krokiType: 'd2' },
  { id: 'svgbob', label: 'Svgbob 🌐', clientSide: false, krokiType: 'svgbob' },
  { id: 'ditaa', label: 'Ditaa 🌐', clientSide: false, krokiType: 'ditaa' },
  { id: 'nomnoml', label: 'Nomnoml 🌐', clientSide: false, krokiType: 'nomnoml' },
  { id: 'seqdiag', label: 'Seqdiag 🌐', clientSide: false, krokiType: 'seqdiag' },
  { id: 'actdiag', label: 'Actdiag 🌐', clientSide: false, krokiType: 'actdiag' },
  { id: 'nwdiag', label: 'Nwdiag 🌐', clientSide: false, krokiType: 'nwdiag' },
  { id: 'rackdiag', label: 'Rackdiag 🌐', clientSide: false, krokiType: 'rackdiag' },
  { id: 'erd', label: 'ERD (Kroki) 🌐', clientSide: false, krokiType: 'erd' },
  { id: 'bytefield', label: 'Bytefield 🌐', clientSide: false, krokiType: 'bytefield' },
  { id: 'packetdiag', label: 'Packetdiag 🌐', clientSide: false, krokiType: 'packetdiag' }
];
```
- Icons: ⚡ = client-side rendering (Mermaid), 🌐 = remote Kroki rendering
- `krokiType` maps directly to Kroki API endpoint path

**Template structure** (in `data.js`):
```javascript
const TEMPLATES = [
  { 
    key: 'flowchart_td',                    // Unique identifier
    label: 'Flowchart (Top-Down)',          // Display name in dropdown
    category: 'Process & Flow',             // Groups templates in dropdown
    engine: 'mermaid',                      // Which engine renders this template
    code: `flowchart TD ...`                // Diagram code (template literal)
  },
  // ... 18 more templates
];
```
- **19 templates total**: 9 Mermaid, 4 PlantUML, 3 Graphviz, 3 D2
- Categories: "Process & Flow", "Software Architecture", "Data & Relationships", "Planning & Timeline", "Networks & Graphs"
- Dropdown builder filters by selected engine and groups by category
- Clicking a template populates textarea and auto-renders with appropriate engine

**Element references** (defined in `els` object):
All DOM elements cached at initialization for performance:
```javascript
const els = {
  input: document.getElementById('mmd-input'),
  preview: document.getElementById('preview'),
  diagramType: document.getElementById('diagram-type'),        // Engine selector
  engineBadge: document.getElementById('engine-badge'),        // Preview badge
  krokiBase: document.getElementById('kroki-base'),            // Kroki URL input
  suppressEngineWarning: document.getElementById('suppress-engine-warning'),  // Checkbox
  btnDownloadPng: document.getElementById('btn-download-png'),
  // ... ~32 total elements
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

## Kroki Integration

**What is Kroki**:
- Unified diagram API supporting 20+ diagram engines (PlantUML, Graphviz, D2, Mermaid, etc.)
- Public instance: `https://kroki.io`
- Self-hosting supported (Docker image available)
- CORS-enabled for browser POST requests

**API Endpoints Used**:
```
POST ${krokiBase}/${engineType}/svg
POST ${krokiBase}/${engineType}/png
Content-Type: text/plain
Body: raw diagram code
```

Resilience (Nov 2025): public kroki.io occasionally returns HTTP 504 (Cloudflare) for POST traffic. The app implements a multi-step fallback in `krokiRequest()`:

```
1) POST text/plain
2) POST application/json { diagram_source }
3) If engineType === 'graphviz', also try 'dot'
4) GET /{engine}/{format}/{deflate+base64url(code)}
```

If all fail (likely outage), the UI suggests retrying later or setting a custom Kroki base URL (self-host or regional mirror) in Advanced settings.

**Timeout Settings**:
- SVG rendering: 20 seconds
- PNG export: 30 seconds
- Health check: 5 seconds

**Security Measures**:

1. **SVG Sanitization** (`sanitizeSvg()` function):
   - Strips all `<script>` tags from Kroki responses
   - Removes event handler attributes (`onclick`, `onload`, etc.)
   - Uses DOMParser + XMLSerializer for safe DOM manipulation
   - Fallback: regex-based script tag removal if parsing fails
   - Applied before inserting SVG into preview

2. **Fetch Timeout** (`fetchWithTimeout()` helper):
   - Uses AbortController to enforce timeouts
   - Prevents hanging on slow/unresponsive Kroki instances
   - Cleans up timers and signals properly

3. **Error Handling**:
   - HTTP errors displayed with status code
   - Network failures caught and shown as "service unavailable"
   - User-friendly messages ("Kroki render error") + raw error details

**Performance Optimizations**:

1. **Session Caching**:
   - Kroki SVG responses cached in sessionStorage
   - Cache key: `kroki:${engineId}:${simpleHash(code)}`
   - TTL: 5 minutes (auto-expires)
   - Avoids redundant API calls when user re-renders same diagram
   - Cache cleared on page refresh (session-scoped)

2. **Availability Check**:
   - One-time health check per session: POST minimal PlantUML diagram
   - Result cached in sessionStorage as `kroki:available`
   - Prevents repeated health checks
   - Fast-fail if Kroki is down (shows error immediately)

3. **Hash Function** (`simpleHash()`):
   - Simple 32-bit hash for cache keys
   - Fast (~1ms for typical diagram sizes)
   - Collisions unlikely for session-scoped cache

**Configurable Kroki Base**:
- Users can override Kroki URL in Advanced settings
- Useful for self-hosted instances or regional mirrors
- Stored in `localStorage` as `mmd.krokiBase`
- Default: `https://kroki.io`

**Self-Hosting Kroki**:
- Docker: `docker run -p 8000:8000 yuzutech/kroki`
- Set custom base URL to `http://localhost:8000` (or your host)
- Ensure CORS headers enabled for browser requests
- See logs/plan-expansion.md for detailed setup

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
- **Update (Oct 2025)**: Direction selector now automatically disables when non-Mermaid engines selected

**6. Kroki API availability**
- **Dependency**: PlantUML, Graphviz, D2 require internet connection to Kroki
- **Risk**: Public kroki.io could have downtime or rate limits
- **Mitigation**: 
  - Availability check cached per session (fast-fail if down)
  - Clear error messages shown to user
  - Self-hosting option available for production use
- **Offline**: Mermaid diagrams work offline; Kroki engines require network

**7. Kroki response time**
- **Latency**: Remote rendering adds 200-1000ms vs client-side Mermaid
- **Mitigation**: 
  - Session caching reduces repeated calls (5min TTL)
  - "Rendering..." toast provides immediate feedback
  - Timeout after 20s with clear error message
- **Large diagrams**: Complex diagrams may take 2-5 seconds to render

---

## Template System

**How templates work**:
1. `data.js` exports `DIAGRAM_ENGINES` and `TEMPLATES` arrays to global scope
2. `app.js` reads both on initialization
3. `buildTemplateDropdown()` filters templates by selected engine and groups by category
4. Each template click: sets textarea value, saves to localStorage, calls `renderDiagram()`
5. Rendering routes to appropriate engine (Mermaid client-side or Kroki API)

**Adding a new template**:
1. Edit `data.js`
2. Add object to `TEMPLATES` array:
   ```javascript
   { 
     key: 'unique_key',                // Use snake_case
     label: 'Display Name',            // Shown in dropdown
     category: 'Process & Flow',       // See categories below
     engine: 'mermaid',                // 'mermaid', 'plantuml', 'graphviz', or 'd2'
     code: `diagram type\n  ...`       // Diagram code for specified engine
   }
   ```
3. Refresh page; new template appears in dropdown when appropriate engine selected

**Template categories** (current, use-case based):
- **Process & Flow**: Flowcharts, sequence, activity, use case (6 templates)
- **Software Architecture**: Components, deployment, layers (5 templates)
- **Data & Relationships**: ER, class, tree (3 templates)
- **Planning & Timeline**: Gantt, timeline (2 templates)
- **Networks & Graphs**: Git graph, dependencies, topology (4 templates)

**Template distribution** (30 total):
- **Mermaid (9)**: flowchart TD/LR, sequence, class, state, ER (Mermaid), git graph, user journey, quadrant, timeline
- **PlantUML (4)**: component, use case, activity, deployment
- **Graphviz (3)**: directed graph, hierarchical tree, network topology
- **D2 (3)**: simple architecture, layered system, grid layout
- **Svgbob (1)**: ASCII sketch starter
- **Ditaa (1)**: ASCII art diagram with boxes and colors
- **Nomnoml (1)**: conceptual model (student/course)
- **Seqdiag (1)**: alt sequence (client/server/DB)
- **Actdiag (1)**: alt activity pipeline
- **Nwdiag (2)**: LAN segments, WAN design
- **Rackdiag (1)**: simple rack layout
- **ERD (Kroki) (1)**: basic relational diagram
- **Bytefield (1)**: memory layout map
- **Packetdiag (1)**: protocol stack packet layout

**Removed / Deferred templates**:
- **Kanban**: Not a supported Mermaid type
- **Mindmap**: Parser instability causing page hangs
- **BPMN**: Deferred (XML editing overhead)
- **Vega/Vega-Lite**: Deferred (client-side visualization libs larger than current scope)
- **Excalidraw**: Deferred (canvas/editor mode out of current scope)

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

**SVG/PNG Export**:
- Must use `XMLSerializer` instead of `.outerHTML` to avoid HTML entity encoding (`&gt;` instead of `>`)
- Must clone SVG and ensure `xmlns="http://www.w3.org/2000/svg"` attribute for standalone rendering
- `addPaddingToSVG()` must use `DOMParser` not `innerHTML` for proper XML parsing
- Without these fixes: XML parsing errors in downloaded SVGs, blank PNG exports

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
- `renderDiagram()` - Main render entry point, routes by engine
- `renderKroki()` - Kroki API rendering (PlantUML/Graphviz/D2)
- `downloadSVG()` - SVG export (works for all engines)
- `downloadPNG()` - PNG export router (native for Mermaid, Kroki for others)
- `downloadPngFromKroki()` - Kroki PNG endpoint handler
- `saveState()` / `restoreState()` - localStorage persistence (includes engine)
- `buildTemplateDropdown()` - Populates template menu (filtered by engine)
- `updateEngineBadge()` - Updates preview badge with current engine
- `sanitizeSvg()` - Strips scripts and event handlers from Kroki responses
- `getCachedKrokiSvg()` / `setCachedKrokiSvg()` - Session cache helpers
- `checkKrokiAvailability()` - One-time health check per session
- `fetchWithTimeout()` - Fetch with AbortController timeout
- `makeFriendlyHint()` - Error message translation

**Initialization order**:
1. `restoreState()` - Load saved settings, diagram, and engine selection
2. `initMermaid()` - Configure Mermaid with theme
3. `bindEvents()` - Attach click handlers, keyboard shortcuts, engine change handler
4. `buildTemplateDropdown()` - Create template menu (filtered by engine)
5. `updateEngineBadge()` - Show current engine in preview badge
6. `loadFromHash()` - If permalink in URL, load and render (engine included in config)

**Event listeners**:
- Render: button click, Ctrl/Cmd+Enter
- Engine change: rebuild template dropdown, update badge, show warning toast (unless suppressed), disable direction for non-Mermaid
- Theme/direction change: auto-render on dropdown change (direction disabled for non-Mermaid engines)
- Export buttons: click to download (routed by engine)
- Advanced panel: toggle visibility
- Presets: apply settings but don't auto-download
- Settings changes: auto-save to localStorage

---

## Recent Changes (October–November 2025)

**Multi-Engine Expansion**:
- Initial (Oct): Added support for PlantUML, Graphviz, D2 via Kroki API
- Phase 2 (Nov): Added Kroki engines Svgbob, Nomnoml, Seqdiag, Actdiag, Nwdiag, Rackdiag, ERD (Kroki), Bytefield, Packetdiag (total engines now 13)
- Added second Nwdiag template (WAN design) + starter templates for each new engine
- Direction selector auto-disables for non-Mermaid engines

**Performance & Security**:
- Implemented session caching for Kroki responses (5min TTL)
- Added SVG sanitization (strips scripts and event handlers)
- Kroki availability pre-flight check (cached per session)
- Fetch timeout enforcement (20s SVG, 30s PNG)

**Configuration**:
- User-configurable Kroki base URL (supports self-hosting)
- "Don't show engine switch warning" checkbox
- Engine selection persisted in localStorage
- Permalinks now include engine in config

**Export Enhancement**:
- Hybrid PNG export: native for Mermaid, Kroki API for others
- Kroki PNG endpoint integration (direct binary download)
- **Automatic fallback**: If Kroki PNG fails (e.g., D2 doesn't support PNG endpoint), automatically converts SVG to PNG via Canvas
- Fixed XML parsing errors by using XMLSerializer instead of .outerHTML
- Added xmlns attribute enforcement for proper SVG rendering
- Fixed blank PNG exports by using DOMParser in addPaddingToSVG
- Maintained native SVG→Canvas quality for Mermaid diagrams

---

**Last Updated**: November 12, 2025  
**Mermaid Version**: 10.9.4 (pinned)  
**Kroki Integration**: Active (public instance + self-hosting support)  
**Status**: Production-ready with expanded multi-engine support (14 engines total)

---
## New Engines (Phase 2 Summary)

| Engine | Use Case | Notes |
|--------|----------|-------|
| Svgbob | Quick ASCII sketches | Fast ideation, lightweight |
| Ditaa | ASCII art box diagrams | Structured boxes with colors/shadows/3D effects |
| Nomnoml | Conceptual class/ER models | Simple syntax for teaching |
| Seqdiag | Alternate sequence diagrams | Complements Mermaid/PlantUML |
| Actdiag | Activity/process flows | Blockdiag ecosystem |
| Nwdiag | Network segments/VLAN/WAN | Supports subnet annotations |
| Rackdiag | Physical rack layouts | Hardware planning/inventory |
| ERD (Kroki) | Simple relational schemas | Minimal, complements Mermaid ER |
| Bytefield | Memory/packet layouts | Systems & protocol teaching |
| Packetdiag | Protocol stack diagrams | Network upgrade documentation |

All new engines use the existing Kroki request pipeline (`renderKroki`, `krokiRequest`, PNG fallback) and integrate with session caching & SVG sanitization automatically.

````
