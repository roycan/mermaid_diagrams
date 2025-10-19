# User Acceptance Testing (UAT) - Multi-Engine Diagram Converter

**Project**: Multi-Engine Diagram Converter  
**Date**: October 19, 2025  
**Version**: 2.0 (Multi-Engine)  
**Test Environment**: Browser (Chrome/Firefox/Safari), Internet connection required for Kroki

---

## Test Suite 1: Core Mermaid Rendering (Client-Side)

### UAT-1.1: Basic Mermaid Rendering
- [ ] Open `index.html` in browser
- [ ] Default engine should be "Mermaid ⚡"
- [ ] Paste a simple flowchart into textarea
- [ ] Click "Render" or press Ctrl/Cmd+Enter
- [ ] Verify diagram appears in preview
- [ ] Verify "Rendered successfully" toast shows
- [ ] Verify engine badge shows "Mermaid ⚡"

### UAT-1.2: Mermaid Theme Support
- [ ] Render a diagram with default theme
- [ ] Change theme to "dark" in dropdown
- [ ] Verify diagram re-renders with dark theme
- [ ] Try "forest" and "neutral" themes
- [ ] Verify each theme applies correctly

### UAT-1.3: Mermaid Direction Control
- [ ] Enter a flowchart without direction (just "flowchart")
- [ ] Select "LR" from direction dropdown
- [ ] Verify diagram re-renders left-to-right
- [ ] Try "TB", "BT", "RL"
- [ ] Verify direction changes each time

### UAT-1.4: Mermaid Error Handling
- [ ] Enter invalid Mermaid syntax (e.g., missing arrow)
- [ ] Click Render
- [ ] Verify red error box appears
- [ ] Verify friendly hint is shown (not just cryptic error)
- [ ] Click "Show details ▸" and verify raw error appears
- [ ] Fix syntax and render again
- [ ] Verify error box disappears

---

## Test Suite 2: Multi-Engine Switching

### UAT-2.1: Engine Selector Presence
- [ ] Verify engine selector dropdown exists in toolbar
- [ ] Verify it has 4 options: Mermaid ⚡, PlantUML 🌐, Graphviz 🌐, D2 🌐
- [ ] Verify icons distinguish client (⚡) vs remote (🌐)

### UAT-2.2: Engine Switching with Warning
- [ ] Start with Mermaid selected
- [ ] Switch to PlantUML
- [ ] Verify warning toast appears: "plantuml selected — keeping editor text. Syntax may differ..."
- [ ] Verify textarea content is preserved (not cleared)
- [ ] Verify template dropdown now shows only PlantUML templates

### UAT-2.3: Suppress Engine Warning
- [ ] Open Advanced settings (click "More options ▸")
- [ ] Check "Don't show engine switch warning"
- [ ] Switch from PlantUML to Graphviz
- [ ] Verify no warning toast appears
- [ ] Uncheck the suppress checkbox
- [ ] Switch to D2
- [ ] Verify warning toast appears again

### UAT-2.4: Direction Selector Disables for Non-Mermaid
- [ ] Select Mermaid engine
- [ ] Verify direction dropdown is enabled
- [ ] Switch to PlantUML
- [ ] Verify direction dropdown is disabled (grayed out)
- [ ] Try Graphviz and D2
- [ ] Verify direction stays disabled
- [ ] Switch back to Mermaid
- [ ] Verify direction is enabled again

---

## Test Suite 3: Template System

### UAT-3.1: Template Filtering by Engine
- [ ] Select Mermaid engine
- [ ] Open "Insert template" dropdown
- [ ] Count templates (should be 9 Mermaid templates)
- [ ] Verify categories: Process & Flow, Software Architecture, Data & Relationships, Planning & Timeline, Networks & Graphs
- [ ] Switch to PlantUML
- [ ] Open template dropdown
- [ ] Verify only 4 PlantUML templates shown
- [ ] Verify categories: Software Architecture, Process & Flow

### UAT-3.2: Template Insertion and Rendering
- [ ] Select PlantUML engine
- [ ] Click "Component Diagram" template
- [ ] Verify textarea fills with PlantUML code
- [ ] Verify diagram auto-renders via Kroki
- [ ] Verify preview shows component diagram
- [ ] Try Graphviz "Directed Graph" template
- [ ] Verify auto-switch to Graphviz engine and render

### UAT-3.3: Empty Template List
- [ ] If you create a test engine with no templates (modify data.js temporarily)
- [ ] Verify dropdown shows "No templates for [engine]. Try another engine or create your own."
- [ ] Restore data.js

---

## Test Suite 4: Kroki Integration (Remote Rendering)

### UAT-4.1: PlantUML Rendering via Kroki
- [ ] Select PlantUML engine
- [ ] Paste or use template: `@startuml\nA -> B\n@enduml`
- [ ] Click Render
- [ ] Verify "Rendering..." toast appears
- [ ] Verify diagram renders within 1-3 seconds (internet required)
- [ ] Verify "Rendered via Kroki" success toast
- [ ] Verify engine badge shows "PlantUML 🌐"

### UAT-4.2: Graphviz Rendering via Kroki
- [ ] Select Graphviz engine
- [ ] Use "Directed Graph" template
- [ ] Click Render
- [ ] Verify diagram renders with colored edges
- [ ] Verify success toast

### UAT-4.3: D2 Rendering via Kroki
- [ ] Select D2 engine
- [ ] Use "Simple Architecture" template
- [ ] Click Render
- [ ] Verify diagram renders with shapes (person, rectangle, cylinder)
- [ ] Verify arrows and labels appear

### UAT-4.4: Kroki Error Handling
- [ ] Select PlantUML
- [ ] Enter invalid PlantUML syntax (e.g., missing `@enduml`)
- [ ] Click Render
- [ ] Verify error message mentions HTTP status or Kroki error
- [ ] Verify raw error details available
- [ ] Fix syntax and re-render successfully

### UAT-4.5: Kroki Timeout Handling
- [ ] Select PlantUML
- [ ] Enter extremely large diagram (500+ nodes, or very complex)
- [ ] If it times out (20s), verify clear "timeout" or "unavailable" error
- [ ] If it renders, note the time taken

---

## Test Suite 5: Export Functionality

### UAT-5.1: SVG Export (All Engines)
- [ ] Render a Mermaid diagram
- [ ] Click "Download SVG"
- [ ] Verify SVG file downloads with correct filename
- [ ] Open SVG in editor or browser, verify it's valid
- [ ] Repeat for PlantUML, Graphviz, D2
- [ ] Verify all engines produce valid SVG exports

### UAT-5.2: PNG Export (Mermaid - Native)
- [ ] Render a Mermaid flowchart
- [ ] Set scale to 2, white background, 16px padding
- [ ] Click "Download PNG"
- [ ] Verify PNG downloads
- [ ] Open PNG, verify text is crisp and readable
- [ ] Verify padding and white background applied

### UAT-5.3: PNG Export (Kroki - API)
- [ ] Render a PlantUML diagram
- [ ] Click "Download PNG"
- [ ] Verify PNG downloads directly from Kroki
- [ ] Open PNG, verify quality is good
- [ ] Try Graphviz and D2 PNG exports
- [ ] Verify all work correctly

### UAT-5.4: Export Presets
- [ ] Click "Poster mode" preset
- [ ] Verify toast confirms preset applied
- [ ] Check Advanced settings: scale=3, bg=#ffffff, padding=32
- [ ] Click "LMS mode"
- [ ] Verify scale=2, bg=transparent, padding=16
- [ ] Click "Quick share (SVG)"
- [ ] Verify toast suggests Copy SVG or Permalink

### UAT-5.5: Copy SVG to Clipboard
- [ ] Render any diagram
- [ ] Click "Copy SVG"
- [ ] Paste into text editor
- [ ] Verify SVG code appears
- [ ] Test with Kroki-rendered diagram too

---

## Test Suite 6: State Persistence

### UAT-6.1: Diagram Text Persistence
- [ ] Enter a diagram in textarea
- [ ] Refresh the page
- [ ] Verify diagram text restored

### UAT-6.2: Engine Selection Persistence
- [ ] Select PlantUML engine
- [ ] Refresh page
- [ ] Verify PlantUML is still selected
- [ ] Verify template dropdown shows PlantUML templates

### UAT-6.3: Settings Persistence
- [ ] Change theme to "dark"
- [ ] Change direction to "LR"
- [ ] Set scale to 3, padding to 32
- [ ] Refresh page
- [ ] Verify all settings restored

### UAT-6.4: Kroki Base URL Persistence
- [ ] Open Advanced settings
- [ ] Set Kroki base to custom value (e.g., `http://localhost:8000`)
- [ ] Refresh page
- [ ] Verify custom URL persisted in input field

---

## Test Suite 7: Permalink Sharing

### UAT-7.1: Create Permalink (Mermaid)
- [ ] Render a Mermaid diagram
- [ ] Click "Copy permalink"
- [ ] Verify "Permalink copied" toast
- [ ] Paste URL into new browser tab
- [ ] Verify diagram, theme, settings restored correctly

### UAT-7.2: Create Permalink (Kroki Engine)
- [ ] Render a PlantUML diagram
- [ ] Click "Copy permalink"
- [ ] Open in new tab
- [ ] Verify PlantUML engine selected
- [ ] Verify diagram renders via Kroki

### UAT-7.3: Backward Compatibility
- [ ] If you have an old Mermaid-only permalink (no engine in config)
- [ ] Open it
- [ ] Verify it defaults to Mermaid engine
- [ ] Verify diagram renders correctly

---

## Test Suite 8: Security & Performance

### UAT-8.1: SVG Sanitization
- [ ] Render a Kroki diagram (PlantUML/Graphviz/D2)
- [ ] Inspect preview element in browser DevTools
- [ ] Verify no `<script>` tags in SVG
- [ ] Verify no `onclick` or other event handlers in SVG elements

### UAT-8.2: Session Caching
- [ ] Render a PlantUML diagram (first time, note time ~1-2s)
- [ ] Without changing code, render again
- [ ] Verify second render is instant (<100ms)
- [ ] Wait 6 minutes
- [ ] Render again
- [ ] Verify cache expired, takes ~1-2s again (re-fetches from Kroki)

### UAT-8.3: Kroki Availability Check
- [ ] Open browser DevTools → Network tab
- [ ] Select PlantUML and render first diagram
- [ ] Verify one health check POST to `/plantuml/svg` with minimal code
- [ ] Render another PlantUML diagram
- [ ] Verify NO second health check (cached availability)
- [ ] Refresh page and render PlantUML
- [ ] Verify health check happens again (new session)

---

## Test Suite 9: Offline & Error Scenarios

### UAT-9.1: Mermaid Works Offline
- [ ] Disconnect from internet
- [ ] Select Mermaid engine
- [ ] Render a flowchart
- [ ] Verify it works (client-side, no network needed)

### UAT-9.2: Kroki Fails Gracefully Offline
- [ ] Disconnect from internet
- [ ] Select PlantUML engine
- [ ] Try to render
- [ ] Verify error message: "Kroki service unavailable" or similar
- [ ] Verify no browser hang or crash

### UAT-9.3: Invalid Kroki Base URL
- [ ] Open Advanced settings
- [ ] Set Kroki base to invalid URL (e.g., `http://invalid-url.local`)
- [ ] Select PlantUML and try to render
- [ ] Verify error message clearly indicates Kroki unavailable
- [ ] Reset Kroki base to default or empty (should use https://kroki.io)

---

## Test Suite 10: UI/UX Polish

### UAT-10.1: Toast Notifications
- [ ] Perform various actions: render, export, copy, preset
- [ ] Verify toast appears for each action
- [ ] Verify toasts auto-dismiss after ~2.5 seconds
- [ ] Verify toast colors: success (green), error (red), warning (yellow), info (blue)

### UAT-10.2: Engine Badge
- [ ] Switch between engines
- [ ] Verify badge updates each time showing engine label with icon
- [ ] Verify badge is visible and unobtrusive

### UAT-10.3: Advanced Panel Toggle
- [ ] Click "More options ▸"
- [ ] Verify panel expands showing scale, bg, padding, filename, Kroki URL, suppress checkbox
- [ ] Click again (now says "More options ▾")
- [ ] Verify panel collapses

### UAT-10.4: Keyboard Shortcut
- [ ] Type diagram code in textarea
- [ ] Press Ctrl+Enter (or Cmd+Enter on Mac)
- [ ] Verify diagram renders without clicking button

---

## Pass/Fail Criteria

**Pass**: All checkboxes in a test suite can be checked ✓  
**Fail**: Any checkbox cannot be checked (feature broken, unexpected behavior, poor UX)

**Critical Tests** (must pass for production):
- UAT-1.1, UAT-1.4 (Mermaid core rendering and errors)
- UAT-2.1, UAT-2.2 (Engine switching)
- UAT-4.1, UAT-4.2, UAT-4.3 (Kroki rendering for all engines)
- UAT-5.1, UAT-5.2, UAT-5.3 (Export functionality)
- UAT-6.1, UAT-6.2 (State persistence)
- UAT-8.1 (Security - SVG sanitization)
- UAT-9.2 (Offline error handling)

---

## Test Summary

**Total Test Cases**: 58  
**Test Suites**: 10  
**Estimated Testing Time**: 45-60 minutes for full manual run

**Sign-off**:
- [ ] All critical tests pass
- [ ] No major bugs found
- [ ] Performance acceptable (Kroki < 3s, Mermaid instant)
- [ ] Security verified (sanitization working)
- [ ] Ready for production deployment

---

**Last Updated**: October 19, 2025  
**Tested By**: _________________  
**Date Tested**: _________________  
**Result**: ☐ Pass  ☐ Fail  ☐ Pass with minor issues
