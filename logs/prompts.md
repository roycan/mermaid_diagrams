# 🧠 AI Assistant Prompts for Mermaid Diagram Converter

Welcome! This file contains ready-to-use prompts for getting AI assistants up to speed on this project. Just copy-paste the relevant prompt into your new chat session.

---

## 🔄 Full Context Reload

**When to use**: Starting a fresh chat session, general exploration, or when AI needs complete project understanding.

**Prompt**:
```
Hi! I'm working on a Mermaid diagram converter web app. Before we begin, please read the project context file to understand the codebase:

📄 **File to read**: `logs/project-context.md` (attach this file)

**Quick summary**:
- **What it does**: Converts Mermaid diagram code to SVG/PNG with quality controls
- **Tech**: Vanilla JS, Mermaid v10.9.4, Canvg, Bulma CSS
- **Key files**: index.html (UI), app.js (logic), data.js (templates), style.css
- **Recent fixes**: PNG quality improvements, template stability (removed kanban/mindmap)

Once you've read the context, I need help with: [describe what you want to do]
```

---

## 📝 Working with Templates

**When to use**: Adding, modifying, or debugging diagram templates in the dropdown menu.

**Prompt**:
```
I need help with the template system in my Mermaid converter app. 

📄 **Please read**: `logs/project-context.md` (attach) — focus on the "Template System" section

**What you need to know**:
- Templates are defined in `data.js` as a `TEMPLATES` array
- Each template has: key, label, category, and code (Mermaid syntax)
- Categories: Core, Software & Systems, Planning
- Removed templates: kanban (unsupported type), mindmap (parser hangs)

**My task**: [e.g., "Add a new pie chart template" or "Fix syntax in the state diagram template"]
```

---

## 🖼️ Debugging Exports (SVG/PNG)

**When to use**: PNG quality issues, download button problems, or export-related bugs.

**Prompt**:
```
I'm troubleshooting the export functionality (SVG/PNG downloads) in my Mermaid app.

📄 **Please read**: `logs/project-context.md` (attach) — pay special attention to "Export Pipeline Deep Dive"

**Background**:
- PNG export uses **native SVG→Canvas rendering first**, then Canvg fallback
- Padding/background applied via SVG manipulation before export
- Scale factor (1-4) controls output resolution
- Previous issues we fixed: blurry text (now crisp), unresponsive button (now works)

**Current issue**: [describe what's not working, e.g., "PNG has white borders" or "Download button does nothing"]
```

---

## ✨ Adding New Features

**When to use**: Implementing new functionality, UI additions, or extending core capabilities.

**Prompt**:
```
I want to add a new feature to my Mermaid diagram converter.

📄 **Please read**: `logs/project-context.md` (attach) — especially "Architecture & Data Flow" and "Key Code Patterns"

**Architecture notes**:
- All logic is in `app.js` (~550 lines, vanilla JS)
- State persists to localStorage with namespaced keys (LS_KEYS object)
- UI uses Bulma CSS framework
- No backend—everything runs client-side

**Feature I want to add**: [describe the feature, e.g., "Add a zoom control for the preview" or "Export to PDF format"]

**Questions**: 
1. Does this fit the current architecture?
2. Are there existing patterns I should follow?
3. What's the best approach?
```

---

## 🔧 Quick Fixes & Hotfixes

**When to use**: Small targeted changes, bug fixes, or tweaking existing functionality.

**Prompt**:
```
I need a quick fix for my Mermaid converter app.

📄 **Optional**: Attach `logs/project-context.md` if you need full context (for larger fixes)

**Quick summary of the app**:
- Vanilla JS app that renders Mermaid diagrams and exports to SVG/PNG
- Main files: app.js (logic), data.js (templates), index.html (UI)
- Uses Mermaid v10.9.4, Bulma CSS

**The issue**: [describe concisely, e.g., "Toast notification disappears too fast" or "Theme dropdown not saving to localStorage"]

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

- **File Structure**: Where things are and what each file does
- **Dependencies**: Exact CDN versions and why they're pinned
- **Export Pipeline Deep Dive**: How PNG export works (native + Canvg fallback)
- **Known Issues & Workarounds**: What's broken/removed and why
- **Template System**: How to add/modify templates
- **Common Pitfalls**: Mermaid syntax quirks and localStorage limits

Example: *"Please read the 'Export Pipeline Deep Dive' section in project-context.md before we debug this PNG issue."*

---

## 🚀 Advanced Usage

**Chaining prompts**: For complex multi-step work:
1. Start with **Full Context Reload**
2. Once AI confirms they've read the context, give specific task details
3. Reference specific sections: *"As mentioned in the Known Issues section..."*

**Iterative refinement**: After AI suggests a solution:
- *"Does this follow the existing code patterns in app.js?"*
- *"Will this affect localStorage state management?"*
- *"How does this interact with the template dropdown?"*

**Code review requests**:
```
I've made changes to [file]. Please review based on the patterns in project-context.md.
Specifically check:
- Does it follow the existing error handling pattern?
- Will it work with the localStorage persistence?
- Are there edge cases I missed?
```

---

**Last Updated**: October 19, 2025  
**Pro tip**: Bookmark this file! Whenever you start a new chat, just copy the relevant prompt and attach project-context.md. You'll save tons of time re-explaining the project. 🎯
