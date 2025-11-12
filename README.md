# Multi-Engine Diagram Converter

Convert diagram code to SVG and PNG images with support for 14 different diagram engines.

## Features

- 🎨 **14 diagram engines** - Mermaid (client-side) + 13 Kroki-backed engines
- 📦 **30 curated templates** - Get started quickly with pre-built examples
- 💾 **Export to SVG/PNG** - High-quality downloads with customizable scale and padding
- 🎯 **Live preview** - See your diagram update in real-time
- 💻 **Runs locally** - Mermaid renders in your browser, no internet needed
- 🔒 **Self-hosting support** - Use your own Kroki instance for complete control
- 🎨 **Multiple themes** - Default, dark, forest, and neutral themes
- 📋 **Template library** - Organized by use case with one-click insertion

## Supported Diagram Libraries

### Quick List (Copy-Paste Friendly)
```
Supported Diagram Engines (14 total):
• Mermaid (client-side)
• PlantUML
• Graphviz
• D2
• Svgbob
• Ditaa
• Nomnoml
• Seqdiag
• Actdiag
• Nwdiag
• Rackdiag
• ERD (Kroki)
• Bytefield
• Packetdiag
```

### Client-Side Rendering (Offline)
| Engine | Description | Use Cases |
|--------|-------------|-----------|
| **Mermaid** ⚡ | Popular text-based diagramming | Flowcharts, sequence diagrams, class diagrams, state machines, ER diagrams, Gantt charts, timelines, git graphs |

### Kroki-Backed Engines (Requires Internet or Local Kroki)

#### Software & Architecture
| Engine | Description | Use Cases |
|--------|-------------|-----------|
| **PlantUML** 🌐 | Versatile UML diagramming | Component diagrams, use case diagrams, activity diagrams, deployment diagrams |
| **Graphviz** 🌐 | Graph visualization | Directed graphs, hierarchical trees, network topology, dependencies |
| **D2** 🌐 | Modern declarative diagrams | System architecture, layered designs, grid layouts |

#### Network & Infrastructure
| Engine | Description | Use Cases |
|--------|-------------|-----------|
| **Nwdiag** 🌐 | Network diagrams | LAN/WAN segments, VLAN layouts, subnet documentation, campus networks |
| **Rackdiag** 🌐 | Rack layouts | Data center equipment, server racks, hardware inventory |
| **Packetdiag** 🌐 | Packet structures | Protocol stacks, network packet layouts, frame diagrams |

#### Process & Flow
| Engine | Description | Use Cases |
|--------|-------------|-----------|
| **Seqdiag** 🌐 | Sequence diagrams | Client-server interactions, protocol flows, API communication |
| **Actdiag** 🌐 | Activity diagrams | Process workflows, pipeline stages, decision flows |

#### Data & Modeling
| Engine | Description | Use Cases |
|--------|-------------|-----------|
| **ERD (Kroki)** 🌐 | Entity-relationship diagrams | Simple database schemas, relational models |
| **Nomnoml** 🌐 | Conceptual UML | Class diagrams, conceptual models, quick sketches |
| **Bytefield** 🌐 | Memory/packet layouts | Memory maps, data structures, packet headers |

#### Sketching
| Engine | Description | Use Cases |
|--------|-------------|-----------|
| **Svgbob** 🌐 | ASCII art to SVG | Quick whiteboard-style sketches, napkin diagrams |
| **Ditaa** 🌐 | ASCII diagrams with boxes | Architecture sketches, box diagrams, colored boxes with shadows |

## Quick Start

1. Open `index.html` in a modern web browser
2. Select a diagram engine from the dropdown
3. Click "Insert template" to load an example
4. Edit the code in the editor
5. Click "Render" (or press Ctrl/Cmd+Enter)
6. Download as SVG or PNG

## Template Library

**30 templates across 14 engines:**
- **Mermaid (9)**: Flowchart TD/LR, Sequence, Class, State, ER, Git Graph, User Journey, Quadrant, Timeline
- **PlantUML (4)**: Component, Use Case, Activity, Deployment
- **Graphviz (3)**: Directed Graph, Hierarchical Tree, Network Topology
- **D2 (3)**: Simple Architecture, Layered System, Grid Layout
- **Nwdiag (2)**: Network Segments, WAN Design
- **Rackdiag (1)**: Rack Layout
- **Seqdiag (1)**: Sequence Diagram
- **Actdiag (1)**: Activity Diagram
- **Svgbob (1)**: ASCII Sketch
- **Ditaa (1)**: ASCII Art Diagram
- **Nomnoml (1)**: Conceptual Model
- **ERD (1)**: Entity-Relationship
- **Bytefield (1)**: Bytefield Map
- **Packetdiag (1)**: Packet Stack

## Self-Hosting Kroki

For full offline capability and better performance, you can run Kroki locally:

### Quick Start with Podman/Docker
```bash
podman run -d --name kroki -p 127.0.0.1:8000:8000 docker.io/yuzutech/kroki
```

Then set the Kroki base URL in the app's "More options" section to `http://localhost:8000`.

See `kroki-local.md` for detailed setup instructions including auto-start on boot.

## Export Options

### SVG Export
- Clean, scalable vector graphics
- Perfect for documentation and presentations
- One-click copy to clipboard

### PNG Export
- High-quality raster images
- Configurable scale (1-4x)
- Custom background color
- Adjustable padding
- Works offline for Mermaid diagrams

### Export Presets
- **Poster mode**: 3x scale, white background, 32px padding
- **LMS mode**: 2x scale, transparent background, 16px padding
- **Quick share**: Use SVG or permalink for lightweight sharing

## Browser Requirements

- Modern browser with ES6+ support
- JavaScript enabled
- For clipboard features: HTTPS or localhost
- Local storage enabled (for saving preferences)

## Technologies Used

- **Mermaid v10.9.4** - Client-side diagram rendering
- **Kroki API** - Remote rendering for PlantUML, Graphviz, D2, and more
- **Canvg v3.0.1** - SVG-to-Canvas conversion for PNG export
- **Bulma v0.9.4** - CSS framework for UI
- **Vanilla JavaScript** - No frameworks, just clean ES6+

## Documentation

- `logs/project-context.md` - Comprehensive technical documentation
- `logs/prompts.md` - AI assistant prompts for working on this project
- `logs/plan-expansion2.md` - Phase 2 engine expansion plan
- `kroki-local.md` - Local Kroki setup guide

## Use Cases

### Education
- CS courses: flowcharts, algorithms, data structures
- Network administration: topology diagrams, rack layouts
- Database courses: ER diagrams, schema design

### Professional
- Campus network upgrades: LAN/WAN design, infrastructure planning
- System architecture: component diagrams, deployment views
- Documentation: technical specs, API flows, process diagrams

### Research
- Data visualization: conceptual models, relationships
- Technical papers: algorithm flows, system designs
- Presentations: clean, scalable diagrams

## License

This is a standalone web application. Check individual engine licenses:
- Mermaid: MIT License
- Kroki: MIT License
- Individual Kroki engines have their own licenses

## Credits

Built with love for educators, network engineers, and diagram enthusiasts.

**Last Updated**: November 10, 2025
