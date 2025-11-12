# 🧠 AI Assistant Prompts for Multi-Engine Diagram Converter

Welcome! This file contains ready-to-use prompts for getting AI assistants up to speed on this project. Just copy-paste the relevant prompt into your new chat session.

---

## 🔄 Full Context Reload

**When to use**: Starting a fresh chat session, general exploration, or when AI needs complete project understanding.

**Prompt**:
```
Hi! I'm working on a multi-engine diagram converter web app. Before we begin, please read the project context file to understand the codebase:

📄 **File to read**: `logs/project-context.md` (attach this file)

**Quick summary**:
- **What it does**: Converts diagram code to SVG/PNG with support for 14 engines (Mermaid + 13 Kroki-backed: PlantUML, Graphviz, D2, Svgbob, Ditaa, Nomnoml, Seqdiag, Actdiag, Nwdiag, Rackdiag, ERD, Bytefield, Packetdiag)
- **Tech**: Vanilla JS, Mermaid v10.9.4 (client-side), Kroki API (remote), Canvg, Bulma CSS
- **Architecture**: Hybrid rendering (Mermaid local, others via Kroki)
- **Key files**: index.html (UI), app.js (logic ~650 lines), data.js (engines + 30 templates)
- **Recent additions**: Multi-engine support (Oct), Phase 2 expansion (Nov): 10 new engines, session caching, SVG sanitization, Kroki integration

Once you've read the context, I need help with: [describe what you want to do]
```

---

## 🎛️ Working with Multiple Engines

**When to use**: Adding engines, debugging Kroki integration, or engine-specific issues.

**Prompt**:
```
I need help with the multi-engine system in my diagram converter.

📄 **Please read**: `logs/project-context.md` (attach) — focus on "Kroki Integration" and "Architecture & Data Flow"

**What you need to know**:
- **14 engines supported**: Mermaid (client ⚡), PlantUML (Kroki 🌐), Graphviz (Kroki 🌐), D2 (Kroki 🌐), Svgbob (🌐), Ditaa (🌐), Nomnoml (🌐), Seqdiag (🌐), Actdiag (🌐), Nwdiag (🌐), Rackdiag (🌐), ERD/Kroki (🌐), Bytefield (🌐), Packetdiag (🌐)
- **Engine config** in `data.js`: DIAGRAM_ENGINES array with id, label, clientSide, krokiType
- **Rendering router**: renderDiagram() checks engine and routes to Mermaid or renderKroki()
- **Security**: SVG responses sanitized (strips scripts and event handlers)
- **Performance**: Session cache with 5min TTL, availability pre-flight check
- **Config**: User can set custom Kroki base URL for self-hosting

**My task**: [e.g., "Add BlockDiag engine" or "Debug Kroki timeout issues"]
```

---

## 📝 Working with Templates

**When to use**: Adding, modifying, or debugging diagram templates in the dropdown menu.

**Prompt**:
```
I need help with the template system in my multi-engine diagram converter. 

📄 **Please read**: `logs/project-context.md` (attach) — focus on the "Template System" section

**What you need to know**:
- Templates defined in `data.js` as TEMPLATES array (30 total)
- Each template: key, label, category, **engine**, code
- **Categories** (use-case based): Process & Flow, Software Architecture, Data & Relationships, Planning & Timeline, Networks & Graphs
- **Distribution**: 9 Mermaid, 4 PlantUML, 3 Graphviz, 3 D2, 1 Svgbob, 1 Ditaa, 1 Nomnoml, 1 Seqdiag, 1 Actdiag, 2 Nwdiag, 1 Rackdiag, 1 ERD (Kroki), 1 Bytefield, 1 Packetdiag
- Template dropdown **filters by selected engine** automatically
- Removed templates: kanban (unsupported), mindmap (parser hangs)

**My task**: [e.g., "Add a PlantUML state diagram template" or "Reorganize categories"]
```

---

## 🖼️ Debugging Exports (SVG/PNG)

**When to use**: PNG quality issues, download button problems, or export-related bugs.

**Prompt**:
```
I'm troubleshooting the export functionality (SVG/PNG downloads) in my diagram converter.

📄 **Please read**: `logs/project-context.md` (attach) — pay special attention to "Export Pipeline Deep Dive" and "Architecture & Data Flow"

**Background**:
- **Hybrid export**: Mermaid uses native SVG→Canvas (crisp text), Kroki engines use API PNG endpoint
- **Mermaid PNG**: Native rendering preferred, Canvg fallback if needed
- **Kroki PNG**: Direct binary download from ${krokiBase}/${engine}/png (30s timeout)
- Padding/background applied via SVG manipulation (Mermaid only)
- Scale factor (1-4) controls Mermaid PNG resolution

**Current issue**: [describe what's not working, e.g., "PlantUML PNG not downloading" or "Mermaid PNG has artifacts"]
```

---

## 🔒 Security & Performance

**When to use**: Debugging caching, sanitization issues, or Kroki availability problems.

**Prompt**:
```
I need help with security or performance optimizations in my diagram converter.

📄 **Please read**: `logs/project-context.md` (attach) — focus on "Kroki Integration" section

**What's implemented**:
- **SVG sanitization**: Strips `<script>` tags and `on*` event handlers from Kroki responses
- **Session caching**: Kroki SVGs cached with 5min TTL (key: `kroki:${engine}:${hash(code)}`)
- **Availability check**: One-time health check per session, cached result
- **Fetch timeouts**: 20s SVG, 30s PNG, 5s health check (AbortController)
- **Error handling**: HTTP errors shown with status code, network failures = "unavailable"

**My issue**: [e.g., "Cache not working" or "Sanitization stripping valid SVG elements"]
```

---

## ✨ Adding New Features

**When to use**: Implementing new functionality, UI additions, or extending core capabilities.

**Prompt**:
```
I want to add a new feature to my multi-engine diagram converter.

📄 **Please read**: `logs/project-context.md` (attach) — especially "Architecture & Data Flow" and "Key Code Patterns"

**Architecture notes**:
- Hybrid rendering: Mermaid client-side (instant), Kroki remote (200-1000ms)
- All logic in `app.js` (~650 lines, vanilla JS)
- State persists to localStorage (diagramEngine, krokiBase, suppressEngineWarning)
- Session caching in sessionStorage (Kroki responses, availability check)
- UI uses Bulma CSS framework
- No backend—Mermaid runs locally, Kroki via browser POST

**Feature I want to add**: [describe the feature, e.g., "Add syntax highlighting per engine" or "Implement diagram versioning"]

**Questions**: 
1. Does this fit the hybrid architecture?
2. Should it work for all engines or specific ones?
3. Are there existing patterns I should follow?
```

---

## 🌐 Kroki Self-Hosting & Configuration

**When to use**: Setting up self-hosted Kroki, debugging custom Kroki URLs, or deployment questions.

**Prompt**:
```
I need help with Kroki configuration or self-hosting for my diagram converter.

📄 **Please read**: `logs/project-context.md` and `logs/plan-expansion.md` (attach both)

**Current setup**:
- Default Kroki base: `https://kroki.io` (public instance)
- User-configurable via Advanced settings → "Kroki base URL"
- Stored in localStorage as `mmd.krokiBase`
- Availability check: POST minimal PlantUML to `/plantuml/svg`

**Self-hosting**:
- Docker: `docker run -p 8000:8000 yuzutech/kroki`
- Must enable CORS for browser POST requests
- Set custom URL to `http://localhost:8000` or your host

**My question**: [e.g., "CORS errors with self-hosted Kroki" or "How to set up production Kroki instance"]
```

---

## 🔧 Quick Fixes & Hotfixes

**When to use**: Small targeted changes, bug fixes, or tweaking existing functionality.

**Prompt**:
```
I need a quick fix for my diagram converter app.

📄 **Optional**: Attach `logs/project-context.md` if you need full context (for larger fixes)

**Quick summary of the app**:
- Multi-engine diagram converter: Mermaid (client-side), plus 13 Kroki engines: PlantUML, Graphviz, D2, Svgbob, Ditaa, Nomnoml, Seqdiag, Actdiag, Nwdiag, Rackdiag, ERD, Bytefield, Packetdiag
- Main files: app.js (logic), data.js (engines + templates), index.html (UI)
- 30 templates across 14 engines, session caching, SVG sanitization
- Uses Mermaid v10.9.4, Kroki API, Bulma CSS

**The issue**: [describe concisely, e.g., "Engine badge not updating" or "Direction selector not disabling for D2"]

**Expected behavior**: [what should happen instead]
```

---

## 💡 Tips for Using These Prompts

1. **Always attach `project-context.md`** for full-context prompts—AI reads it better than manual summarization
2. **Customize the bracketed sections** `[like this]` with your specific needs
3. **Add error messages** if you're debugging—paste console logs or error text
4. **Mention what you've tried** so AI doesn't repeat failed approaches
5. **Be specific about scope**: "just change this one function" vs "redesign this whole feature"

---

## 📚 Useful Context Sections to Reference

When chatting with AI, you can point them to specific sections in `project-context.md`:

- **Project Overview**: Multi-engine support, tech stack, hybrid architecture
- **File Structure**: Where things are and what each file does
- **Dependencies**: Exact CDN versions and why Mermaid is pinned to 10.9.4
- **Architecture & Data Flow**: Rendering flow for Mermaid vs Kroki engines
- **Kroki Integration**: API endpoints, security, caching, timeouts, self-hosting
- **Export Pipeline Deep Dive**: How PNG export works (native + Canvg for Mermaid, Kroki API for others)
- **Known Issues & Workarounds**: What's broken/removed and why, Kroki availability risks
- **Template System**: How to add/modify templates, category structure, engine filtering
- **Common Pitfalls**: Mermaid syntax quirks, localStorage limits, Kroki latency

Example: *"Please read the 'Kroki Integration' section in project-context.md before we debug this timeout issue."*

---

## 🚀 Advanced Usage

**Chaining prompts**: For complex multi-step work:
1. Start with **Full Context Reload**
2. Once AI confirms they've read the context, give specific task details
3. Reference specific sections: *"As mentioned in the Kroki Integration section..."*

**Iterative refinement**: After AI suggests a solution:
- *"Does this follow the existing code patterns in app.js?"*
- *"Will this affect localStorage or sessionStorage?"*
- *"How does this interact with the engine selector and template filtering?"*
- *"Does this work for both client-side (Mermaid) and remote (Kroki) engines?"*

**Code review requests**:
```
I've made changes to [file]. Please review based on the patterns in project-context.md.
Specifically check:
- Does it follow the existing error handling pattern?
- Will it work with both Mermaid and Kroki rendering paths?
- Does it handle session caching correctly?
- Are there edge cases I missed (timeouts, offline, CORS)?
```

**Multi-engine considerations**: When adding features, ask AI:
- *"Should this feature work for all engines or just Mermaid?"*
- *"How should this behave when Kroki is unavailable?"*
- *"Does this need different implementations for client-side vs remote rendering?"*

---

**Last Updated**: November 12, 2025  
**Major Update**: Phase 2 engine expansion (added Svgbob, Ditaa, Nomnoml, Seqdiag, Actdiag, Nwdiag, Rackdiag, ERD, Bytefield, Packetdiag)  
**Pro tip**: Bookmark this file! Whenever you start a new chat, just copy the relevant prompt and attach project-context.md. You'll save tons of time re-explaining the project. 🎯
