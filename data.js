// Diagram engine configuration (expanded)
const DIAGRAM_ENGINES = [
  { id: 'mermaid', label: 'Mermaid ⚡', clientSide: true },
  { id: 'plaintext', label: 'Plain Text 📝', clientSide: true },
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

// Template gallery (expanded: 32 curated across 15 engines)
const TEMPLATES = [
  // Mermaid templates (9)
  { key: 'flowchart_td', label: 'Flowchart (Top-Down)', category: 'Process & Flow', engine: 'mermaid', code: `flowchart TD
    A[Start] --> B{Decision?}
    B -- Yes --> C[Do something]
    B -- No --> D[Do something else]
    C --> E[End]
    D --> E` },
  { key: 'flowchart_lr', label: 'Flowchart (Left-Right)', category: 'Process & Flow', engine: 'mermaid', code: `flowchart LR
    A[Input] --> B[Process]
    B --> C[Output]` },
  { key: 'sequence', label: 'Sequence diagram', category: 'Process & Flow', engine: 'mermaid', code: `sequenceDiagram
    participant User
    participant App
    participant Server
    User->>App: Clicks button
    App->>Server: Sends request
    Server-->>App: Returns data
    App-->>User: Shows result` },
  { key: 'class', label: 'Class diagram', category: 'Data & Relationships', engine: 'mermaid', code: `classDiagram
    class Animal {
      +String name
      +eat()
      +sleep()
    }
    class Dog {
      +bark()
    }
    Animal <|-- Dog` },
  { key: 'state', label: 'State diagram', category: 'Process & Flow', engine: 'mermaid', code: `stateDiagram-v2
    [*] --> Idle
    Idle --> Playing : pressPlay
    Playing --> Paused : pressPause
    Paused --> Playing : pressPlay
    Playing --> [*] : stop` },
  { key: 'gitgraph', label: 'Git graph (branching & merging)', category: 'Networks & Graphs', engine: 'mermaid', code: `gitGraph
    commit id: "Init"
    branch feature
    commit id: "Work A"
    checkout main
    commit id: "Hotfix"
    merge feature
    commit id: "Release"` },
  { key: 'er', label: 'ER (Mermaid)', category: 'Data & Relationships', engine: 'mermaid', code: `erDiagram
    STUDENT ||--o{ ENROLLMENT : registers
    COURSE ||--o{ ENROLLMENT : includes
    STUDENT {
      string name
      int student_id
    }
    COURSE {
      string title
      int course_id
    }` },
  { key: 'gantt', label: 'Gantt chart (project timeline)', category: 'Planning & Timeline', engine: 'mermaid', code: `gantt
    title Project Plan
    dateFormat  YYYY-MM-DD
    section Phase 1
    Task A :a1, 2025-10-14, 3d
    Task B :after a1, 2d
    section Phase 2
    Task C :2025-10-20, 4d` },
  { key: 'timeline', label: 'Timeline', category: 'Planning & Timeline', engine: 'mermaid', code: `timeline
    title Evolution of Web
    1990 : HTML invented
    1995 : JavaScript released
    2004 : Web 2.0 era
    2015 : ES6 standard
    2025 : Your project here` },

  // PlantUML templates (4)
  { key: 'plantuml_component', label: 'Component Diagram', category: 'Software Architecture', engine: 'plantuml', code: `@startuml
[Web App] --> [API Gateway]
[API Gateway] --> [Auth Service]
[API Gateway] --> [User Service]
[Auth Service] --> [Database]
[User Service] --> [Database]

package "External Services" {
  [Email Service]
  [Payment Gateway]
}

[User Service] --> [Email Service]
[User Service] --> [Payment Gateway]
@enduml` },
  { key: 'plantuml_usecase', label: 'Use Case Diagram', category: 'Process & Flow', engine: 'plantuml', code: `@startuml
left to right direction
actor "User" as user
actor "Admin" as admin

rectangle "E-commerce System" {
  usecase "Browse Products" as UC1
  usecase "Add to Cart" as UC2
  usecase "Checkout" as UC3
  usecase "Manage Inventory" as UC4
  usecase "View Analytics" as UC5
}

user --> UC1
user --> UC2
user --> UC3
admin --> UC4
admin --> UC5

UC3 ..> UC2 : <<includes>>
@enduml` },
  { key: 'plantuml_activity', label: 'Activity Diagram', category: 'Process & Flow', engine: 'plantuml', code: `@startuml
start
:Receive Order;
if (In Stock?) then (yes)
  :Process Payment;
  if (Payment Success?) then (yes)
    :Ship Order;
    :Send Confirmation;
  else (no)
    :Cancel Order;
    :Refund;
  endif
else (no)
  :Notify Customer;
  :Place on Backorder;
endif
stop
@enduml` },
  { key: 'plantuml_deployment', label: 'Deployment Diagram', category: 'Software Architecture', engine: 'plantuml', code: `@startuml
node "Web Server" {
  [Nginx]
  [Application]
}

node "App Server" {
  [API Service]
  [Worker Processes]
}

database "PostgreSQL" {
  [Primary DB]
}

cloud "CDN" {
  [Static Assets]
}

[Nginx] --> [Application]
[Application] --> [API Service]
[API Service] --> [Primary DB]
[Application] --> [Static Assets]
@enduml` },

  // Graphviz templates (3)
  { key: 'graphviz_directed', label: 'Directed Graph', category: 'Networks & Graphs', engine: 'graphviz', code: `digraph Dependencies {
  rankdir=LR;
  node [shape=box, style=rounded];
  
  A [label="Module A"];
  B [label="Module B"];
  C [label="Module C"];
  D [label="Module D"];
  E [label="Module E"];
  
  A -> B;
  A -> C;
  B -> D;
  C -> D;
  C -> E;
  D -> E;
  
  // Highlight critical path
  edge [color=red, penwidth=2];
  A -> C -> E;
}` },
  { key: 'graphviz_tree', label: 'Hierarchical Tree', category: 'Data & Relationships', engine: 'graphviz', code: `digraph OrgChart {
  node [shape=box, style="rounded,filled", fillcolor=lightblue];
  
  CEO [label="CEO"];
  CTO [label="CTO"];
  CFO [label="CFO"];
  
  VPEng [label="VP Engineering"];
  VPProd [label="VP Product"];
  
  TeamLead1 [label="Team Lead 1"];
  TeamLead2 [label="Team Lead 2"];
  
  CEO -> CTO;
  CEO -> CFO;
  CTO -> VPEng;
  CTO -> VPProd;
  VPEng -> TeamLead1;
  VPEng -> TeamLead2;
}` },
  { key: 'graphviz_network', label: 'Network Topology', category: 'Networks & Graphs', engine: 'graphviz', code: `graph Network {
  layout=neato;
  node [shape=circle, fixedsize=true, width=1];
  
  Server1 [label="Web\\nServer 1", shape=box];
  Server2 [label="Web\\nServer 2", shape=box];
  LB [label="Load\\nBalancer", shape=diamond];
  DB [label="Database", shape=cylinder];
  Cache [label="Redis", shape=ellipse];
  
  LB -- Server1;
  LB -- Server2;
  Server1 -- DB;
  Server2 -- DB;
  Server1 -- Cache;
  Server2 -- Cache;
  
  Internet [label="Internet", shape=cloud];
  Internet -- LB;
}` },

  // D2 templates (3)
  { key: 'd2_architecture', label: 'Simple Architecture', category: 'Software Architecture', engine: 'd2', code: `users: Users {
  shape: person
}

web: Web App {
  shape: rectangle
}

api: API Server {
  shape: rectangle
}

db: Database {
  shape: cylinder
}

cache: Redis Cache {
  shape: cylinder
}

users -> web: HTTPS
web -> api: REST API
api -> db: SQL
api -> cache: Key-Value` },
  { key: 'd2_layered', label: 'Layered System', category: 'Software Architecture', engine: 'd2', code: `direction: down

presentation: Presentation Layer {
  ui: User Interface
  controller: Controllers
}

business: Business Layer {
  services: Business Services
  logic: Business Logic
}

data: Data Layer {
  repositories: Data Repositories
  models: Data Models
}

database: {
  shape: cylinder
  style.fill: "#d4e6f1"
}

presentation.controller -> business.services: API Calls
business.logic -> data.repositories: Data Access
data.repositories -> database: SQL Queries` },
  { key: 'd2_grid', label: 'Grid Layout', category: 'Networks & Graphs', engine: 'd2', code: `grid-rows: 3
grid-columns: 3

header: Header {
  grid-column: 1-3
  style.fill: "#3498db"
}

sidebar: Sidebar {
  grid-row: 2-3
  style.fill: "#95a5a6"
}

main: Main Content {
  grid-row: 2
  grid-column: 2-3
  style.fill: "#ecf0f1"
}

footer: Footer {
  grid-row: 3
  grid-column: 2-3
  style.fill: "#34495e"
}` },

  // Svgbob (ASCII sketch)
  { key: 'svgbob_basic', label: 'ASCII Sketch', category: 'Process & Flow', engine: 'svgbob', code: `+------+    +---------+
+ Box +---->+ Target  +
+------+    +---------+
    |           ^
    v           |
  /---\      /-----\
  | A |      |  B  |
  \---/      \-----/
` },

  // Ditaa (ASCII art boxes with colors/shadows)
  { key: 'ditaa_basic', label: 'ASCII Art Diagram', category: 'Software Architecture', engine: 'ditaa', code: `+--------+   +-------+    +-------+
|        |   | cBLU  |    | cGRE  |
|  User  +-->+  Web  +--->+  API  |
|        |   | Server|    | Layer |
+--------+   +-------+    +-------+
                 |             |
                 v             v
            +--------+    +---------+
            | Cache  |    |Database |
            |  cYEL  |    | cRED    |
            +--------+    +---------+
` },

  // Nomnoml (conceptual class/ER style)
  { key: 'nomnoml_basic', label: 'Conceptual Model', category: 'Data & Relationships', engine: 'nomnoml', code: `#direction: right
[Student]-enrolls->[Course]
[Student|+id; +name]
[Course|+id; +title]
` },

  // Seqdiag (sequence)
  { key: 'seqdiag_basic', label: 'Sequence (Alt)', category: 'Process & Flow', engine: 'seqdiag', code: `seqdiag {
  Client -> Server [label = "Request"];
  Server -> DB [label = "Query"];
  DB -> Server [label = "Rows"];
  Server -> Client [label = "Response"];
}` },

  // Actdiag (activity)
  { key: 'actdiag_basic', label: 'Activity (Alt)', category: 'Process & Flow', engine: 'actdiag', code: `actdiag {
  write -> compile -> test -> deploy
  compile -> error -> write
  test -> error -> write
}` },

  // Nwdiag basic (LAN segments)
  { key: 'nwdiag_basic', label: 'Network Segments', category: 'Networks & Graphs', engine: 'nwdiag', code: `nwdiag {
  network core {
    address = "10.0.0.0/24";
    router;
    firewall;
  }
  network access_a {
    address = "10.0.10.0/24";
    firewall;
    switch_a;
    pc_a;
  }
  network access_b {
    address = "10.0.20.0/24";
    firewall;
    switch_b;
    pc_b;
  }
}` },

  // Nwdiag WAN design (second template)
  { key: 'nwdiag_wan', label: 'WAN Design', category: 'Networks & Graphs', engine: 'nwdiag', code: `nwdiag {
  network wan {
    address = "203.0.113.0/30";
    isp_router;
    edge_router;
  }
  network campus_core {
    address = "10.1.0.0/16";
    edge_router;
    core_sw1;
    core_sw2;
  }
  network access_vlan10 {
    address = "10.1.10.0/24";
    core_sw1;
    access_sw1;
  }
  network access_vlan20 {
    address = "10.1.20.0/24";
    core_sw2;
    access_sw2;
  }
}` },

  // Rackdiag (simple rack layout)
  { key: 'rackdiag_basic', label: 'Rack Layout', category: 'Networks & Graphs', engine: 'rackdiag', code: `rackdiag {
  1: UPS
  2: CoreSwitch
  3: Firewall
  4: Server01
  5: Server02
}` },

  // ERD (Kroki)
  { key: 'erd_basic', label: 'ERD (Kroki)', category: 'Data & Relationships', engine: 'erd', code: `[Student]
*id
name
email
+enrollment_id

[Course]
*id
title
credits

[Enrollment]
*id
+student_id
+course_id
grade

Student *--* Enrollment
Course *--* Enrollment` },

  // Bytefield (memory layout)
  { key: 'bytefield_basic', label: 'Bytefield Map', category: 'Data & Relationships', engine: 'bytefield', code: `bytefield {
  (header: 2) (payload: 6) (checksum: 2)
}` },

  // Packetdiag (protocol stack)
  { key: 'packetdiag_basic', label: 'Packet Stack', category: 'Networks & Graphs', engine: 'packetdiag', code: `packetdiag {
  0-13: Ethernet
  14-33: IP
  34-53: TCP
  54-?: Data
}` },

  // Plain Text templates
  { key: 'plaintext_html_doc', label: 'HTML Documentation', category: 'Process & Flow', engine: 'plaintext', code: `┌─────────────────────────────────────────────────────────┐
│              HTML FORM STRUCTURE                        │
└─────────────────────────────────────────────────────────┘

<form action="/submit" method="POST">
│
├─ <fieldset> Contact Information
│  │
│  ├─ <legend>Personal Details</legend>
│  │
│  ├─ <label for="name">Full Name:</label>
│  │   <input type="text" id="name" required>
│  │      └─ CONNECTED BY "for" and "id" ─┘
│  │
│  └─ <label for="email">Email:</label>
│      <input type="email" id="email" required>
│
└─ <button type="submit">Submit</button>


KEY CONCEPTS
════════════
✓ Labels improve accessibility
✓ "for" attribute connects label to input
✓ Click label → focuses input
✓ Screen readers announce relationships
` },

  { key: 'plaintext_ascii_box', label: 'ASCII Box Diagram', category: 'Software Architecture', engine: 'plaintext', code: `┌──────────────────────────────────────────────────────┐
│                    SYSTEM ARCHITECTURE               │
└──────────────────────────────────────────────────────┘

          ┌─────────────┐
          │   Browser   │
          └──────┬──────┘
                 │ HTTPS
                 ↓
          ┌─────────────┐
          │ Web Server  │
          │   (Nginx)   │
          └──────┬──────┘
                 │
       ┌─────────┴─────────┐
       ↓                   ↓
┌─────────────┐     ┌─────────────┐
│ Application │     │   Static    │
│   Server    │────→│   Assets    │
│  (Node.js)  │     │    (CDN)    │
└──────┬──────┘     └─────────────┘
       │
       ↓
┌─────────────┐
│  Database   │
│ (PostgreSQL)│
└─────────────┘


NOTES
═════
→ Arrows show data flow
• Boxes represent services
• Text labels describe components
` },
];