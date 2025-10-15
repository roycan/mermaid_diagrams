// Template gallery (10 curated)
const TEMPLATES = [
  { key: 'flowchart_td', label: 'Flowchart (Top-Down)', category: 'Core', code: `flowchart TD
    A[Start] --> B{Decision?}
    B -- Yes --> C[Do something]
    B -- No --> D[Do something else]
    C --> E[End]
    D --> E` },
  { key: 'flowchart_lr', label: 'Flowchart (Left-Right)', category: 'Core', code: `flowchart LR
    A[Input] --> B[Process]
    B --> C[Output]` },
  { key: 'sequence', label: 'Sequence diagram', category: 'Core', code: `sequenceDiagram
    participant User
    participant App
    participant Server
    User->>App: Clicks button
    App->>Server: Sends request
    Server-->>App: Returns data
    App-->>User: Shows result` },
  { key: 'class', label: 'Class diagram', category: 'Core', code: `classDiagram
    class Animal {
      +String name
      +eat()
      +sleep()
    }
    class Dog {
      +bark()
    }
    Animal <|-- Dog` },
  { key: 'state', label: 'State diagram', category: 'Core', code: `stateDiagram-v2
    [*] --> Idle
    Idle --> Playing : pressPlay
    Playing --> Paused : pressPause
    Paused --> Playing : pressPlay
    Playing --> [*] : stop` },
  { key: 'gitgraph', label: 'Git graph (branching & merging)', category: 'Software & Systems', code: `gitGraph
    commit id: "Init"
    branch feature
    commit id: "Work A"
    checkout main
    commit id: "Hotfix"
    merge feature
    commit id: "Release"` },
  { key: 'er', label: 'Entity-Relationship (ER) diagram', category: 'Software & Systems', code: `erDiagram
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
  { key: 'gantt', label: 'Gantt chart (project timeline)', category: 'Planning', code: `gantt
    title Project Plan
    dateFormat  YYYY-MM-DD
    section Phase 1
    Task A :a1, 2025-10-14, 3d
    Task B :after a1, 2d
    section Phase 2
    Task C :2025-10-20, 4d` },
  { key: 'kanban', label: 'Kanban board', category: 'Planning', code: `kanban
    title Project Tasks
    section To Do
      Task 1
      Task 2
    section In Progress
      Task 3
    section Done
      Task 4` },
  { key: 'timeline', label: 'Timeline', category: 'Planning', code: `timeline
    title Evolution of Web
    1990 : HTML invented
    1995 : JavaScript released
    2004 : Web 2.0 era
    2015 : ES6 standard
    2025 : Your project here` },
];