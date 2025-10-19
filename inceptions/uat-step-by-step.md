# Step-by-Step UAT Guide - Multi-Engine Diagram Converter

**Purpose**: Follow this guide to systematically test all features of the diagram converter.  
**Time Required**: 45-60 minutes  
**Prerequisites**: Browser (Chrome/Firefox/Safari), Internet connection for Kroki tests

---

## 🚀 Getting Started

### Setup
- [ ] Open `index.html` in your browser
- [ ] Open browser DevTools (F12) and check Console tab for any errors
- [ ] Have this checklist open in a separate window/tab
- [ ] Clear browser cache and localStorage if testing fresh state (optional)

---

## 📋 Test Sequence

Follow these steps in order. Check each box as you complete it.

---

## Part 1: Basic Mermaid Functionality (10 minutes)

### Step 1: Verify Initial State
- [ ] Page loads without errors
- [ ] Engine selector shows "Mermaid ⚡" selected
- [ ] Template dropdown exists and shows "Insert template"
- [ ] Textarea is empty or has restored content
- [ ] Preview area shows engine badge: "Mermaid ⚡"

### Step 2: Render Your First Diagram
- [ ] Copy this code into the textarea:
```
flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Check console]
    C --> E[Continue testing]
```
- [ ] Click "Render" button (or press Ctrl/Cmd+Enter)
- [ ] Blue toast appears: "Rendering..."
- [ ] Green toast appears: "Rendered successfully."
- [ ] Diagram appears in preview showing flowchart
- [ ] No errors in console

### Step 3: Test Theme Changes
- [ ] Diagram is currently rendered
- [ ] Change theme dropdown to "dark"
- [ ] Diagram re-renders with dark background
- [ ] Change to "forest" - verify green theme
- [ ] Change to "neutral" - verify neutral colors
- [ ] Change back to "default"

### Step 4: Test Direction Control
- [ ] Clear textarea and paste:
```
flowchart
    A --> B --> C
```
- [ ] Select "LR" from direction dropdown
- [ ] Diagram re-renders left-to-right
- [ ] Try "TB" (top-bottom), "BT" (bottom-top), "RL" (right-left)
- [ ] Each direction change triggers re-render

### Step 5: Test Error Handling
- [ ] Clear textarea and paste invalid syntax:
```
flowchart TD
    A -> B
```
(Note: should be `-->` not `->` in Mermaid)
- [ ] Click Render
- [ ] Red error box appears
- [ ] Friendly hint shown (mentions arrows or syntax)
- [ ] Click "Show details ▸"
- [ ] Raw error message expands
- [ ] Click X to close error box
- [ ] Fix syntax to `A --> B`
- [ ] Render again - error box disappears, diagram shows

**Part 1 Complete**: All 5 steps checked ✓

---

## Part 2: Multi-Engine Switching (5 minutes)

### Step 6: Switch to PlantUML
- [ ] Click engine selector dropdown
- [ ] Verify 4 options: Mermaid ⚡, PlantUML 🌐, Graphviz 🌐, D2 🌐
- [ ] Select "PlantUML 🌐"
- [ ] Yellow/orange toast appears: "plantuml selected — keeping editor text. Syntax may differ between engines."
- [ ] Textarea content is preserved (not cleared)
- [ ] Engine badge updates to "PlantUML 🌐"
- [ ] Direction dropdown becomes disabled (grayed out)

### Step 7: Verify Template Filtering
- [ ] Click "Insert template" dropdown
- [ ] Count templates shown (should be exactly 4 PlantUML templates)
- [ ] Verify categories: "Software Architecture" and "Process & Flow"
- [ ] Close dropdown (don't select a template yet)

### Step 8: Test Engine Switch Warning Suppression
- [ ] Click "More options ▸" to expand advanced settings
- [ ] Find checkbox: "Don't show engine switch warning"
- [ ] Check the box
- [ ] Switch to "Graphviz 🌐"
- [ ] Verify NO toast appears
- [ ] Uncheck the suppress box
- [ ] Switch to "D2 🌐"
- [ ] Verify warning toast appears again

### Step 9: Verify Direction Stays Disabled for Non-Mermaid
- [ ] With D2 selected, verify direction dropdown is disabled
- [ ] Switch back to Mermaid ⚡
- [ ] Verify direction dropdown is enabled again
- [ ] Verify warning toast appears (if suppress is unchecked)

**Part 2 Complete**: All 4 steps (6-9) checked ✓

---

## Part 3: Template System (5 minutes)

### Step 10: Use Mermaid Template
- [ ] Ensure Mermaid ⚡ is selected
- [ ] Open "Insert template" dropdown
- [ ] Click "Sequence Diagram" template
- [ ] Textarea fills with Mermaid sequence code
- [ ] Diagram auto-renders showing Alice/Bob sequence
- [ ] Preview shows sequence diagram correctly

### Step 11: Use PlantUML Template
- [ ] Switch to PlantUML 🌐 engine
- [ ] Open template dropdown
- [ ] Click "Component Diagram" template
- [ ] Textarea fills with PlantUML code (starts with `@startuml`)
- [ ] Wait 1-3 seconds for Kroki render
- [ ] Diagram appears showing components and connections
- [ ] Green toast: "Rendered via Kroki."

### Step 12: Use Graphviz Template
- [ ] Switch to Graphviz 🌐
- [ ] Select "Directed Graph" template
- [ ] Diagram renders showing nodes A-E with colored critical path
- [ ] Verify arrows and node labels visible

### Step 13: Use D2 Template
- [ ] Switch to D2 🌐
- [ ] Select "Simple Architecture" template
- [ ] Diagram renders with person icon, rectangles, cylinder shapes
- [ ] Verify arrows and labels (HTTPS, REST API, SQL)

**Part 3 Complete**: All 4 steps (10-13) checked ✓

---

## Part 4: Kroki Integration Tests (8 minutes)

### Step 14: PlantUML Rendering
- [ ] Engine: PlantUML 🌐
- [ ] Clear textarea and paste:
```
@startuml
actor User
User -> System : Request
System -> Database : Query
Database --> System : Data
System --> User : Response
@enduml
```
- [ ] Click Render
- [ ] Blue toast: "Rendering..."
- [ ] Diagram appears within 1-3 seconds
- [ ] Green toast: "Rendered via Kroki."
- [ ] Verify sequence diagram with 3 actors/components

### Step 15: Graphviz Rendering
- [ ] Engine: Graphviz 🌐
- [ ] Clear textarea and paste:
```
digraph Test {
  A -> B;
  B -> C;
  C -> A;
}
```
- [ ] Render
- [ ] Diagram shows 3 nodes in circular dependency
- [ ] Success toast appears

### Step 16: D2 Rendering
- [ ] Engine: D2 🌐
- [ ] Clear textarea and paste:
```
x -> y: hello
y -> z: world
```
- [ ] Render
- [ ] Diagram shows 3 boxes with arrows and labels
- [ ] Success toast

### Step 17: Test Kroki Error
- [ ] Engine: PlantUML 🌐
- [ ] Paste invalid code (missing `@enduml`):
```
@startuml
A -> B
```
- [ ] Click Render
- [ ] Red error box appears
- [ ] Error mentions HTTP status or "Kroki render error"
- [ ] Add `@enduml` at the end
- [ ] Render again - success

### Step 18: Test Session Caching
- [ ] Use the working PlantUML code from Step 17
- [ ] Note the render time (~1-2 seconds)
- [ ] WITHOUT changing code, click Render again
- [ ] Notice instant render (<100ms) - this is the cache working
- [ ] Change one character in the code
- [ ] Render - should take ~1-2 seconds again (cache miss)

**Part 4 Complete**: All 5 steps (14-18) checked ✓

---

## Part 5: Export Functionality (10 minutes)

### Step 19: SVG Export (Mermaid)
- [ ] Switch to Mermaid ⚡
- [ ] Render any flowchart
- [ ] Click "Download SVG"
- [ ] File downloads (check downloads folder)
- [ ] Open SVG file in text editor or browser
- [ ] Verify it's valid SVG (starts with `<svg`, has elements)

### Step 20: SVG Export (Kroki)
- [ ] Switch to PlantUML 🌐
- [ ] Render a component diagram
- [ ] Click "Download SVG"
- [ ] File downloads
- [ ] Open and verify valid SVG

### Step 21: PNG Export (Mermaid - Native)
- [ ] Switch to Mermaid ⚡
- [ ] Render a flowchart
- [ ] Open "More options ▸"
- [ ] Set: Scale=2, Background=#ffffff, Padding=16
- [ ] Click "Download PNG"
- [ ] PNG file downloads
- [ ] Open PNG in image viewer
- [ ] Verify text is crisp and readable
- [ ] Verify white background and padding visible

### Step 22: PNG Export (Kroki - API)
- [ ] Switch to PlantUML 🌐
- [ ] Render a use case diagram
- [ ] Click "Download PNG"
- [ ] PNG downloads (from Kroki API)
- [ ] Open PNG
- [ ] Verify quality is good, text readable

### Step 23: Export Presets
- [ ] Click "Poster mode" button
- [ ] Yellow toast confirms preset applied
- [ ] Open advanced settings
- [ ] Verify: Scale=3, bg=#ffffff, padding=32
- [ ] Click "LMS mode"
- [ ] Toast confirms
- [ ] Verify: Scale=2, bg=transparent, padding=16
- [ ] Click "Quick share (SVG)"
- [ ] Toast says: "Quick share: use Copy SVG or Permalink."

### Step 24: Copy SVG to Clipboard
- [ ] Render any diagram
- [ ] Click "Copy SVG"
- [ ] Blue toast: "SVG copied to clipboard."
- [ ] Open a text editor
- [ ] Paste (Ctrl/Cmd+V)
- [ ] Verify SVG code appears

**Part 5 Complete**: All 6 steps (19-24) checked ✓

---

## Part 6: State Persistence (5 minutes)

### Step 25: Diagram Text Persistence
- [ ] Clear textarea and enter:
```
flowchart LR
    Test --> Persistence
```
- [ ] Do NOT render yet
- [ ] Refresh the browser page (F5 or Ctrl+R)
- [ ] Verify textarea still contains the flowchart code

### Step 26: Engine Persistence
- [ ] Switch to PlantUML 🌐
- [ ] Refresh page
- [ ] Verify PlantUML is still selected in dropdown
- [ ] Verify template dropdown shows PlantUML templates only

### Step 27: Settings Persistence
- [ ] Switch to Mermaid ⚡
- [ ] Change theme to "dark"
- [ ] Change direction to "LR"
- [ ] Open advanced settings
- [ ] Set scale=3, padding=24
- [ ] Refresh page
- [ ] Verify theme is "dark"
- [ ] Verify direction is "LR"
- [ ] Verify scale=3, padding=24

### Step 28: Kroki Base Persistence
- [ ] Open advanced settings
- [ ] In "Kroki base URL" input, enter: `https://demo.kroki.io`
- [ ] Refresh page
- [ ] Open advanced settings
- [ ] Verify Kroki base URL is `https://demo.kroki.io`
- [ ] Clear it back to empty (will use default https://kroki.io)

**Part 6 Complete**: All 4 steps (25-28) checked ✓

---

## Part 7: Permalink Sharing (5 minutes)

### Step 29: Create Mermaid Permalink
- [ ] Switch to Mermaid ⚡
- [ ] Render a flowchart
- [ ] Change theme to "forest"
- [ ] Click "Copy permalink"
- [ ] Blue toast: "Permalink copied."
- [ ] Open a new browser tab
- [ ] Paste URL in address bar and press Enter
- [ ] Verify diagram loads
- [ ] Verify theme is "forest"
- [ ] Verify Mermaid engine selected

### Step 30: Create PlantUML Permalink
- [ ] Switch to PlantUML 🌐
- [ ] Render a sequence diagram
- [ ] Click "Copy permalink"
- [ ] Open new tab with pasted URL
- [ ] Verify PlantUML engine selected
- [ ] Verify diagram renders via Kroki

**Part 7 Complete**: All 2 steps (29-30) checked ✓

---

## Part 8: Security & Performance (5 minutes)

### Step 31: Verify SVG Sanitization
- [ ] Switch to PlantUML 🌐
- [ ] Render any diagram
- [ ] Open browser DevTools (F12)
- [ ] Go to Elements/Inspector tab
- [ ] Find the `<div id="preview">` element
- [ ] Expand the SVG inside
- [ ] Search (Ctrl+F) for `<script` - should find ZERO matches
- [ ] Search for `onclick` - should find ZERO matches
- [ ] If found, sanitization failed ❌

### Step 32: Verify Session Caching (Repeated)
- [ ] Use PlantUML with this code:
```
@startuml
A -> B : test
@enduml
```
- [ ] Render - note time (~1-2s)
- [ ] Render again without changes - instant (<100ms)
- [ ] This confirms caching works

### Step 33: Kroki Availability Check
- [ ] Refresh the page to clear session
- [ ] Open DevTools → Network tab
- [ ] Switch to PlantUML and render a diagram
- [ ] In Network tab, look for POST to `/plantuml/svg`
- [ ] Find the FIRST request (small payload, ~100 bytes) - this is the health check
- [ ] Find the SECOND request (your diagram code) - this is the actual render
- [ ] Render another PlantUML diagram
- [ ] Verify NO new health check (only one render request)
- [ ] Availability check is cached ✓

**Part 8 Complete**: All 3 steps (31-33) checked ✓

---

## Part 9: Offline & Error Scenarios (5 minutes)

### Step 34: Mermaid Works Offline
- [ ] Disconnect from internet (turn off WiFi or unplug ethernet)
- [ ] Switch to Mermaid ⚡
- [ ] Render a flowchart
- [ ] Verify it works perfectly (client-side, no network needed)

### Step 35: Kroki Fails Gracefully Offline
- [ ] Still offline
- [ ] Switch to PlantUML 🌐
- [ ] Try to render
- [ ] Red error box appears
- [ ] Error message mentions "unavailable" or "network" or "fetch failed"
- [ ] No browser hang or crash
- [ ] Page is still responsive

### Step 36: Reconnect and Test Recovery
- [ ] Reconnect to internet
- [ ] Still on PlantUML 🌐
- [ ] Clear the session cache: Refresh page (F5)
- [ ] Render the PlantUML diagram again
- [ ] Verify it works now

**Part 9 Complete**: All 3 steps (34-36) checked ✓

---

## Part 10: UI/UX Polish (5 minutes)

### Step 37: Toast Behavior
- [ ] Perform various actions and observe toasts:
  - Render success - green toast, auto-dismiss ~2.5s
  - Render error - red toast, stays until closed
  - Copy SVG - blue toast, auto-dismiss
  - Preset applied - yellow/orange toast, auto-dismiss
- [ ] Verify toasts don't overlap badly (queue if rapid actions)

### Step 38: Engine Badge Updates
- [ ] Switch through all 4 engines
- [ ] Each time, verify badge updates immediately
- [ ] Verify badge text matches: "Mermaid ⚡", "PlantUML 🌐", etc.

### Step 39: Advanced Panel Toggle
- [ ] Click "More options ▸"
- [ ] Panel expands showing 8+ settings
- [ ] Button text changes to "More options ▾"
- [ ] Click again - panel collapses
- [ ] Button text back to "More options ▸"

### Step 40: Keyboard Shortcut
- [ ] Type new diagram code in textarea
- [ ] Press Ctrl+Enter (Windows/Linux) or Cmd+Enter (Mac)
- [ ] Diagram renders without clicking button
- [ ] Works for both Mermaid and Kroki engines

### Step 41: Clear Button
- [ ] Click "Clear" button
- [ ] Textarea empties
- [ ] Preview area clears (shows empty)
- [ ] Light gray toast: "Cleared."

**Part 10 Complete**: All 5 steps (37-41) checked ✓

---

## 🎯 Final Checklist

### Overall Assessment
- [ ] All 41 steps completed
- [ ] No critical bugs found
- [ ] No console errors during testing
- [ ] Performance is acceptable:
  - Mermaid renders instantly (<100ms)
  - Kroki renders in 1-3 seconds
  - Cached Kroki renders instantly
- [ ] All engines work (Mermaid, PlantUML, Graphviz, D2)
- [ ] All exports work (SVG and PNG for all engines)
- [ ] State persists correctly across refreshes
- [ ] Permalinks work for all engines
- [ ] Security verified (no scripts in Kroki SVGs)
- [ ] Offline behavior acceptable (Mermaid works, Kroki fails gracefully)

---

## 📝 Test Results

**Date Tested**: _________________  
**Browser**: ☐ Chrome  ☐ Firefox  ☐ Safari  ☐ Edge  
**Version**: _________________  
**Tested By**: _________________

**Steps Passed**: _____ / 41  
**Critical Issues Found**: _________________  
**Minor Issues Found**: _________________

**Overall Result**:
- ☐ **PASS** - Ready for production (40-41 steps passed, no critical issues)
- ☐ **PASS WITH MINOR ISSUES** - Can deploy with known minor issues (38-39 steps passed)
- ☐ **FAIL** - Needs fixes before deployment (<38 steps passed or critical bugs found)

**Notes/Comments**:
```
[Add any observations, bugs found, or suggestions here]




```

---

**Thank you for testing! 🎉**

If you found any issues, please document them clearly:
1. Step number where issue occurred
2. Expected behavior
3. Actual behavior
4. Browser/OS details
5. Console errors (if any)
