# User Stories - Multi-Engine Diagram Converter

**Project**: Multi-Engine Diagram Converter  
**Date**: October 19, 2025  
**Status**: Implementation Complete

---

## Epic 1: Core Diagram Rendering

### Story 1.1: View Mermaid Diagrams
- [ ] As a **developer**, I want to **paste Mermaid code into a text editor**, so that **I can visualize my diagram in real-time**
- [ ] As a **developer**, I want to **see syntax errors with helpful hints**, so that **I can quickly fix my diagram code**
- [ ] As a **developer**, I want to **choose from multiple themes (default, dark, forest, neutral)**, so that **my diagrams match my presentation style**

### Story 1.2: Multi-Engine Support
- [ ] As a **developer**, I want to **switch between diagram engines (Mermaid, PlantUML, Graphviz, D2)**, so that **I can use the best tool for each diagram type**
- [ ] As a **technical writer**, I want to **see which engine is currently selected**, so that **I don't accidentally paste wrong syntax**
- [ ] As a **developer**, I want to **see a visual indicator (⚡ vs 🌐) showing client-side vs remote rendering**, so that **I understand performance expectations**

### Story 1.3: Diagram Templates
- [ ] As a **new user**, I want to **browse diagram templates organized by use case**, so that **I can quickly start with a working example**
- [ ] As a **developer**, I want to **see only templates compatible with my selected engine**, so that **I don't waste time trying incompatible examples**
- [ ] As a **developer**, I want to **insert a template with one click**, so that **I can modify it instead of starting from scratch**

---

## Epic 2: Diagram Export

### Story 2.1: SVG Export
- [ ] As a **developer**, I want to **download diagrams as SVG**, so that **I can embed scalable graphics in my documentation**
- [ ] As a **developer**, I want to **copy SVG code to clipboard**, so that **I can paste it directly into HTML/Markdown files**
- [ ] As a **technical writer**, I want to **export diagrams from all engines as SVG**, so that **I have consistent vector output regardless of engine**

### Story 2.2: PNG Export with Quality Control
- [ ] As a **developer**, I want to **download diagrams as PNG with configurable scale (1-4x)**, so that **I can control image resolution**
- [ ] As a **developer**, I want to **add padding and background color to PNG exports**, so that **my diagrams look professional in presentations**
- [ ] As a **content creator**, I want to **crisp, readable text in exported PNGs**, so that **my diagrams are publication-quality**
- [ ] As a **developer**, I want to **export Kroki-rendered diagrams directly as PNG**, so that **I get consistent server-side rendering quality**

### Story 2.3: Export Presets
- [ ] As a **presenter**, I want to **apply "Poster Mode" preset (3x scale, white bg, 32px padding)**, so that **my diagrams look great on large screens**
- [ ] As a **teacher**, I want to **apply "LMS Mode" preset (2x scale, transparent bg, 16px padding)**, so that **my diagrams blend into learning management systems**
- [ ] As a **developer**, I want to **apply "Quick Share" preset**, so that **I'm reminded to use SVG or permalinks for fastest sharing**

---

## Epic 3: State Persistence & Sharing

### Story 3.1: State Management
- [ ] As a **developer**, I want to **have my diagram text saved automatically**, so that **I don't lose work when I refresh the page**
- [ ] As a **developer**, I want to **have my theme and export settings remembered**, so that **I don't reconfigure every session**
- [ ] As a **developer**, I want to **have my selected engine persisted**, so that **my workflow continues seamlessly across sessions**

### Story 3.2: Diagram Sharing
- [ ] As a **developer**, I want to **generate a shareable permalink for my diagram**, so that **I can share it with teammates via URL**
- [ ] As a **reviewer**, I want to **open a permalink and see the exact diagram and settings**, so that **I can review what was shared**
- [ ] As a **developer**, I want to **old Mermaid-only permalinks to still work**, so that **backward compatibility is maintained**

---

## Epic 4: Kroki Integration & Performance

### Story 4.1: Remote Rendering
- [ ] As a **developer**, I want to **render PlantUML diagrams via Kroki API**, so that **I can create component and deployment diagrams**
- [ ] As a **architect**, I want to **render Graphviz diagrams via Kroki API**, so that **I can visualize dependencies and network topology**
- [ ] As a **developer**, I want to **render D2 diagrams via Kroki API**, so that **I can create clean architectural diagrams**
- [ ] As a **user**, I want to **see clear error messages when Kroki is unavailable**, so that **I know the issue is with the remote service, not my diagram**

### Story 4.2: Performance Optimization
- [ ] As a **developer**, I want to **have Kroki responses cached for 5 minutes**, so that **re-rendering the same diagram is instant**
- [ ] As a **user**, I want to **have Kroki availability checked once per session**, so that **I get fast-fail errors without repeated health checks**
- [ ] As a **developer**, I want to **have render timeouts enforced (20s SVG, 30s PNG)**, so that **slow diagrams don't hang my browser**

### Story 4.3: Self-Hosting & Configuration
- [ ] As a **enterprise user**, I want to **configure a custom Kroki base URL**, so that **I can use my self-hosted Kroki instance**
- [ ] As a **privacy-conscious user**, I want to **use Mermaid offline without Kroki**, so that **my diagrams never leave my machine**
- [ ] As a **developer**, I want to **Kroki base URL setting saved**, so that **I don't re-enter it every session**

---

## Epic 5: Security & Safety

### Story 5.1: Content Sanitization
- [ ] As a **security-conscious user**, I want to **have Kroki SVG responses sanitized**, so that **malicious scripts cannot execute in my browser**
- [ ] As a **user**, I want to **event handlers stripped from remote SVGs**, so that **unexpected interactions don't occur**

### Story 5.2: Error Handling
- [ ] As a **user**, I want to **see friendly error hints for common syntax mistakes**, so that **I can fix issues without reading cryptic parser errors**
- [ ] As a **developer**, I want to **see detailed error messages in a collapsible section**, so that **I can debug complex syntax issues**
- [ ] As a **user**, I want to **errors cleared automatically when I render successfully**, so that **stale error messages don't confuse me**

---

## Epic 6: User Experience & Usability

### Story 6.1: Keyboard Shortcuts
- [ ] As a **power user**, I want to **press Ctrl/Cmd+Enter to render**, so that **I can quickly iterate without clicking**

### Story 6.2: Visual Feedback
- [ ] As a **user**, I want to **see toast notifications for all actions (render success, export success, errors)**, so that **I always know what happened**
- [ ] As a **user**, I want to **toasts to auto-dismiss after 2.5 seconds**, so that **they don't clutter my screen**
- [ ] As a **developer**, I want to **see an engine badge in the preview area**, so that **I always know which engine rendered my diagram**

### Story 6.3: Engine Switching UX
- [ ] As a **developer**, I want to **be warned when switching engines that syntax may differ**, so that **I'm reminded to adjust my code**
- [ ] As a **power user**, I want to **suppress the engine switch warning**, so that **I'm not annoyed by repeated notifications**
- [ ] As a **user**, I want to **the direction selector disabled for non-Mermaid engines**, so that **I don't try to use unsupported features**

### Story 6.4: Advanced Settings
- [ ] As a **advanced user**, I want to **toggle advanced options (scale, padding, bg, filename, Kroki URL)**, so that **simple settings aren't overwhelming**
- [ ] As a **developer**, I want to **reset all settings to defaults with one click**, so that **I can recover from misconfiguration easily**

---

## Epic 7: Documentation & Onboarding

### Story 7.1: In-App Guidance
- [ ] As a **new user**, I want to **see a tip about Ctrl/Cmd+Enter at the bottom**, so that **I discover the keyboard shortcut**
- [ ] As a **user**, I want to **see help text under each advanced setting**, so that **I understand what each option does**

### Story 7.2: Template Discovery
- [ ] As a **new user**, I want to **templates grouped by category (Process & Flow, Architecture, etc.)**, so that **I can find relevant examples quickly**
- [ ] As a **developer**, I want to **see template names that describe their purpose**, so that **I can identify the right starting point**

---

## Acceptance Criteria Summary

**Total User Stories**: 47  
**Epics**: 7

**Priority Breakdown**:
- **P0 (Must Have)**: Core rendering, basic export, state persistence (Stories 1.1-1.3, 2.1-2.2, 3.1)
- **P1 (Should Have)**: Multi-engine, Kroki integration, security (Stories 1.2, 4.1-4.3, 5.1-5.2)
- **P2 (Nice to Have)**: Presets, advanced UX, performance optimization (Stories 2.3, 4.2, 6.1-6.4)
- **P3 (Future)**: Additional engines, collaboration features, syntax highlighting

---

**Status**: ✅ All P0, P1, and P2 stories implemented as of October 19, 2025
