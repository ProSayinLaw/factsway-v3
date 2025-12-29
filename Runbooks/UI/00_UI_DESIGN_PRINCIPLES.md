# FACTSWAY UI Design Principles

**Status:** Draft - Awaiting User Approval
**Purpose:** Define the visual language and interaction patterns before detailed specification

---

## 1. Visual Identity

### Color Palette (from mockups)

| Name | Hex | Usage |
|------|-----|-------|
| **Desk Background** | `#f0f0eb` | App background (like a wooden desk) |
| **Paper White** | `#ffffff` | Document/card surfaces |
| **Header Dark** | `#292524` | Top navigation bar |
| **Accent Orange** | `#c2410c` | Primary actions, active states, folder tabs |
| **Accent Gold** | `#b45309` | AI insights, strategic briefs |
| **Text Ink** | `#1f2937` | Primary text |
| **Text Muted** | `#6b7280` | Secondary text, labels |
| **Border Subtle** | `#d6d3d1` | Dividers, card borders |
| **AI Note BG** | `#fffbeb` | AI suggestion backgrounds |
| **AI Note Border** | `#f59e0b` | AI suggestion borders |
| **User Note BG** | `#eff6ff` | User note backgrounds |
| **User Note Border** | `#3b82f6` | User note borders, linked sentences |

### Typography

| Role | Font | Size | Weight |
|------|------|------|--------|
| **Headings** | Source Serif Pro | 1rem+ | 700 |
| **UI Text** | Inter | 0.8-0.85rem | 400-600 |
| **Monospace** | JetBrains Mono | 0.8rem | 400-500 |
| **Legal Document** | Times New Roman | 1.15rem | 400 |

### Visual Metaphor: "Legal Redweld"

The UI evokes a **legal professional's desk**:
- Background = wooden desk surface
- White cards = papers on the desk
- Clerk panels = folders in a redweld folder
- Orange accent = redweld folder tab color
- Dark header = office credenza/bookshelf

---

## 2. Layout Patterns

### Primary Layout: 3-Panel Drafting View

```
┌─────────────────────────────────────────────────────────┐
│  [Tabs: Home | Cruz v. JS7 | Smith Case]                │
├──────────────┬────────────────────────┬─────────────────┤
│              │                        │                 │
│   CLERKS     │       DOCUMENT         │     ASSETS      │
│   SIDEBAR    │       EDITOR           │     PANEL       │
│   (340px)    │       (flex)           │     (300px)     │
│              │                        │                 │
│  [Expanded]  │   ┌──────────────┐     │  [Evidence]     │
│  [Expanded]  │   │   Paper      │     │  [Suggested]    │
│  [Collapsed] │   │   Preview    │     │                 │
│  [Collapsed] │   └──────────────┘     │                 │
├──────────────┴────────────────────────┴─────────────────┤
│  [Global Chatbox]                                       │
└─────────────────────────────────────────────────────────┘
```

### Secondary Layout: Control + Preview (Caseblock/Signature)

```
┌─────────────────────────────────────────────────────────┐
│  [Tabs]                                                 │
├────────────────────────┬────────────────────────────────┤
│                        │                                │
│   CONTROL PANEL        │       LIVE PREVIEW             │
│   (460px)              │       (flex)                   │
│                        │                                │
│   - Form fields        │   ┌──────────────────────┐     │
│   - Toggles            │   │   Document Preview   │     │
│   - Options            │   │   (paper sheet)      │     │
│                        │   └──────────────────────┘     │
│                        │                                │
└────────────────────────┴────────────────────────────────┘
```

---

## 3. Component Patterns

### Clerk Panel (Sidebar)

**Expanded State:**
```
┌─────────────────────────────────────────┐
│ 📊 Discovery              [↑] [▢]      │ ← Header (clickable to collapse)
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ ✨ STRATEGIC INSIGHT       AI CLERK │ │ ← Strategy Brief (gold)
│ │ Issue: JS7 produced...              │ │
│ │ Strategy: Request native format...  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ REQUEST TYPE                            │ ← Form Label (uppercase, muted)
│ ┌─────────────────────────────────────┐ │
│ │ Request for Production        ✓     │ │ ← Selected Option
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Interrogatory                       │ │ ← Unselected Option
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │  → Generate Request                 │ │ ← Action Button (orange)
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Collapsed State:**
```
┌─────────────────────────────────────────┐
│ 📊 Discovery                      [12] │ ← Badge shows count
└─────────────────────────────────────────┘
```

### Margin Cards (Document Annotations)

```
     Document Text                           Margin
┌────────────────────────────────┐    ┌─────────────────────┐
│ "...in its original native     │----│ METADATA TRAP   🤖  │ ← AI Card (gold)
│ electronic format..."          │    │ If metadata shows   │
└────────────────────────────────┘    │ creation date...    │
                                      └─────────────────────┘
                                      ┌─────────────────────┐
                                      │ MY NOTE         👤  │ ← User Card (blue)
                                      │ Jag admitted in the │
                                      │ hearing...          │
                                      └─────────────────────┘
```

### Case Tabs (Browser-Style)

```
┌─────────┬─────────────┬─────────────┬───┐
│  Home   │ Cruz v. JS7 │ Smith Case  │ + │
│         │         [×] │         [×] │   │
└─────────┴─────────────┴─────────────┴───┘
     ↑          ↑              ↑        ↑
  Always     Active        Inactive   New
  visible    (light bg)    (dark bg)  case
```

---

## 4. Interaction Patterns

### Hover States
- Cards: Slight lift (`box-shadow` increase)
- Buttons: Darken background
- Tabs: Lighten background, show border indicator

### Click Targets
- All clickable areas minimum 44×44px
- Clerk headers are click-to-collapse targets
- Tab × buttons are separate click targets from tab itself

### Keyboard Shortcuts (Proposed)
| Shortcut | Action |
|----------|--------|
| `Cmd+1-9` | Toggle clerk 1-9 |
| `Cmd+N` | New draft |
| `Cmd+E` | Export current draft |
| `Cmd+/` | Open command palette |
| `Esc` | Close modal/float |

### Drag & Drop
- Evidence items → Document (creates citation)
- Clerk panels → Reorder in sidebar
- **BLOCKED:** Cross-case drag (isolation requirement)

---

## 5. Design Decisions Requiring Approval

Before proceeding to mockups, confirm:

1. **Color palette** - Do these colors match your vision?
2. **"Redweld" metaphor** - Does this resonate for legal professionals?
3. **3-panel layout** - Is this the correct primary structure?
4. **Clerk panel design** - Does the expanded/collapsed pattern work?
5. **Margin cards** - Is the AI/User distinction clear enough?

---

**Next Step:** Once principles approved, I'll generate visual mockups for each view.
