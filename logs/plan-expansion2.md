# Multi-Engine Expansion Plan (Phase 2) - November 10, 2025

## Scope
Add additional Kroki-backed diagram engines to broaden coverage for teaching, MIS planning, and network upgrade documentation while keeping implementation effort low.

## Engines To Add (Immediate Set)
| Engine ID | Kroki Type | Category (UI) | Purpose | Complexity | Notes |
|-----------|------------|---------------|---------|------------|-------|
| svgbob | svgbob | Sketch & ASCII | Quick sketches/whiteboard replacement | Low | ASCII to SVG |
| nomnoml | nomnoml | UML & Models | Simple class/ER-style conceptual diagrams | Low | Minimal syntax |
| seqdiag | seqdiag | Communication | Sequence diagrams (alternative to Mermaid/PlantUML) | Low | Blockdiag family |
| actdiag | actdiag | Process & Activity | Activity/process flows | Low | Blockdiag family |
| nwdiag | nwdiag | Network | Network segments, subnets | Low | Blockdiag family |
| rackdiag | rackdiag | Physical Infra | Rack layouts for hardware inventory | Low | Blockdiag family |
| erd | erd | Data Model | Simple entity-relationship diagrams | Low | Basic; later consider Mermaid ER |
| bytefield | bytefield | Architecture | Memory layouts, packet structures | Low | Great for CS teaching |
| packetdiag | packetdiag | Network | Packet diagrams / protocol frames | Low | Complements nwdiag |

Excluded for now: BPMN (XML-heavy), Vega/Vega-Lite (client-side JSON & larger libs), Excalidraw (canvas editor).

## Rationale
- All targeted engines are Kroki-backed: no new rendering pipeline required.
- Network/MIS upgrade: nwdiag, rackdiag, packetdiag help document topology, physical infrastructure, and protocol framing.
- Teaching & research: bytefield (systems), seqdiag (protocol flows), svgbob (rapid ideation), nomnoml (conceptual modeling).
- ER modeling: "erd" provides quick schema sketches now; Mermaid erDiagram can be added later for richer relationships.

## Changes Required
1. data.js
   - Extend DIAGRAM_ENGINES with new entries (id, label, krokiType).
   - Provide initial template code for each engine (simple, instructive). Each template should fit existing categories or introduce new ones.
2. app.js
   - No core rendering changes; existing `renderKroki()` handles any krokiType.
   - Ensure direction selector remains disabled for all non-Mermaid engines (already implemented).
   - Update engine badge formatting if necessary (add icons for new categories). Optional.
3. index.html
   - Add new <option> items in the engine selector OR refactor engine selector to build dynamically from DIAGRAM_ENGINES (preferred small enhancement later).
4. Documentation
   - Update `logs/project-context.md` with new engine list and categories.
   - Add quick syntax notes for each new engine (may reference external docs).
5. Templates System
   - Add starter examples with minimal but meaningful diagrams (e.g., nwdiag with two subnets; rackdiag with two units; bytefield with header/body fields; packetdiag with layers).

## Category Grouping (Proposed)
- Sketch & ASCII: svgbob
- UML & Models: nomnoml, erd
- Communication: seqdiag
- Process & Activity: actdiag
- Network: nwdiag, packetdiag
- Physical Infra: rackdiag
- Architecture & Systems: bytefield

(Existing categories can be reused; if we exceed comfortable size, consider category restructuring.)

## Templates (Concept Draft)
- svgbob: simple ASCII art block
- nomnoml: basic class relationship
- seqdiag: client -> server -> database
- actdiag: start -> decision -> branch
- nwdiag: two networks with hosts
- rackdiag: rack with server nodes
- erd: two entities with relationship (if we keep Mermaid ER template, rename labeling for clarity)
- bytefield: 3-row memory map (header, payload, checksum)
- packetdiag: layered packet (Ethernet, IP, TCP, Payload)

## Feasibility & Risk Assessment
| Area | Status | Notes |
|------|--------|-------|
| Rendering pipeline | Ready | `renderKroki()` generic; no change needed |
| PNG export | Ready | `downloadPngFromKroki()` works for any krokiType; fallback already in place |
| Caching | Ready | Session cache keyed by engineId + code; new IDs integrate automatically |
| Security | Low risk | SVG sanitization applies uniformly |
| UI complexity | Low | More options in selector; may consider dynamic build later |
| Performance | Low impact | Additional engines only add dropdown items; no extra libs |
| Maintainability | Acceptable | Engines fully declarative in `data.js` |
| User confusion | Mitigated | Provide clear starter templates & help docs |

## Edge Cases & Considerations
- Some engines may not support PNG endpoint (fallback already implemented via SVG→Canvas).
- Large bytefield diagrams: ensure POST still used; fallback GET only triggers on network error.
- ERD vs Mermaid ER naming: Clarify in templates; maybe label Mermaid template as "ER (Mermaid)" and Kroki one as "ER (Kroki)" later.
- Template dropdown could become crowded; future enhancement: search/filter field.

## Future (Not In This Phase)
- Mermaid ERD enriched features (client-side).
- BPMN (later if process modeling becomes priority).
- Interactive charts (Vega-Lite) if research needs demand data visualization.
- Excalidraw canvas mode for freeform sketching.

## Acceptance Criteria (Phase 2 Immediate)
- Engine selector lists new engines (at least nwdiag, rackdiag, seqdiag, actdiag, svgbob, nomnoml, erd, bytefield, packetdiag).
- Selecting a new engine updates badge and loads a starter template via template dropdown.
- Rendering succeeds against local or public Kroki without code changes.
- PNG and SVG exports succeed (either direct PNG or fallback conversion).
- Documentation updated with engine summary & template examples.

## Rollout Strategy
1. Add engines + templates in `data.js`.
2. Update engine selector in `index.html` (static for now).
3. Test each template render (local Kroki recommended).
4. Export PNG/SVG for each to verify pipeline.
5. Update `logs/project-context.md` with new engines.
6. Optionally refactor engine selector to dynamic build for future scalability.

## Go/No-Go Summary
- Go: All required foundational code paths are generic and already in place.
- No blocking dependencies.
- Low implementation risk and high immediate utility.

*Prepared: November 10, 2025.*
