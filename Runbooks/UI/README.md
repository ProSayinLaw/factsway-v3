# FACTSWAY UI Mockups V2 - Clerk Sidebar System

**Created:** December 27, 2024  
**Status:** Interactive HTML prototypes  
**Purpose:** Visual validation of 8-clerk architecture before Phase 4 implementation

---

## 📂 Files Overview

### **01-clerk-sidebar-system.html** ⭐ START HERE
**Main interface mockup showing the complete clerk sidebar system**

**What you'll see:**
- Left sidebar with 2 clerks expanded (To-Do + Notes)
- 7 collapsed clerk tabs below
- Center editor with legal document
- Interactive expand/collapse
- Split view demo
- Float window demo

**Key interactions:**
- Click clerk headers to expand/collapse
- Hover over clerk panels to see action icons (collapse, split, float)
- Click collapsed tabs at bottom to expand
- Check/uncheck to-do items
- Click "Split View" icon to see clerk in split mode

**This demonstrates:** The Cursor/VS Code panel pattern you liked!

---

### **02-todo-clerk-full.html**
**Detailed To-Do clerk in all 3 modes**

**Modes shown:**
1. **Sidebar Mode** - Compact 300px width, quick actions only
2. **Split Mode** - Half-screen with full task management, stats, filters
3. **Full Window** - Independent window with complete features

**Features demonstrated:**
- Task creation with priority, due date, case linking
- Overdue/due soon indicators (red/orange)
- Priority badges (High/Medium/Low)
- Completed task strikethrough
- Stats dashboard (overdue, due soon, completed, total)
- Case filtering
- Task details and metadata

**Use this to validate:** Task management UX and layout options

---

### **03-notes-clerk-full.html**
**Detailed Notes clerk in all 3 modes**

**Modes shown:**
1. **Sidebar Mode** - Quick capture with tagging
2. **Split Mode** - Browse notes grid with search
3. **Full Editor** - Markdown editor with live editing

**Features demonstrated:**
- Quick note capture
- Tag system (Strategy, Research, Questions)
- Pin to top functionality
- Markdown support (headers, bold, italic, lists, code)
- Link notes to drafts
- Search and filter
- Note metadata (timestamps, links)
- Live editing area

**Use this to validate:** Note-taking UX and markdown editing experience

---

## 🎯 How to Review

### **Step 1: Open Main Mockup**
```bash
# Open in browser
open "01-clerk-sidebar-system.html"
```

**What to evaluate:**
- ✅ Does the clerk sidebar feel natural?
- ✅ Is expand/collapse intuitive?
- ✅ Do the 2 default clerks (To-Do + Notes) make sense?
- ✅ Is the sidebar width (320px) comfortable?
- ✅ Do the collapsed tabs work well?

### **Step 2: Review To-Do Clerk**
```bash
open "02-todo-clerk-full.html"
```

**What to evaluate:**
- ✅ Is sidebar mode too cramped? Just right?
- ✅ Does split mode show enough detail?
- ✅ Is full window mode useful or overkill?
- ✅ Are priority/due date indicators clear?
- ✅ Is task creation modal easy to use?

### **Step 3: Review Notes Clerk**
```bash
open "03-notes-clerk-full.html"
```

**What to evaluate:**
- ✅ Is quick capture fast enough?
- ✅ Do tags work well for organization?
- ✅ Is markdown editing intuitive?
- ✅ Does the full editor have enough features?
- ✅ Is linking notes to drafts valuable?

---

## 🎨 Design Tokens Used

All mockups use your existing FACTSWAY design system:

### **Colors**
```css
--bg-desk: #f0f0eb         /* Desk background */
--bg-paper: #ffffff        /* Paper/cards */
--bg-header: #292524       /* Top nav */
--accent-primary: #c2410c  /* Primary actions (orange) */
--accent-link: #3b82f6     /* Links (blue) */
--text-ink: #1f2937        /* Primary text */
--text-muted: #6b7280      /* Secondary text */
--border-subtle: #d6d3d1   /* Borders */
```

### **Fonts**
- **Serif:** Source Serif Pro (headings, titles)
- **Sans:** Inter (body, UI)
- **Mono:** JetBrains Mono (code, technical)

### **Status Colors**
- **Proven/Complete:** #15803d (green)
- **Gap/Overdue:** #b91c1c (red)
- **Weak/Warning:** #d97706 (orange)

---

## 💡 What's NOT Built Yet

These are mockups showing **visual design and layout only**. The following are demonstrated conceptually but not fully functional:

**Not implemented:**
- Actual markdown parsing (just shows example)
- Real calendar picker (just shows date input)
- Task/note persistence (no backend)
- Actual split window code (shows concept)
- Float to independent window (shows concept)
- Drag & drop reordering

**These will be built in Phase 4 (Runbook 8)**

---

## 📝 Feedback Questions

After reviewing, consider:

### **Layout & Flow**
1. Does the clerk sidebar system make sense?
2. Is the default state (2 expanded, 7 collapsed) optimal?
3. Should clerks auto-collapse when you expand a different one?
4. Is 320px the right sidebar width, or adjust?

### **To-Do Clerk**
5. Are the 3 modes (sidebar/split/full) all needed?
6. Is priority + due date enough metadata, or add more?
7. Should completed tasks hide automatically after X days?
8. Do you want recurring tasks (e.g., "Review docket every Monday")?

### **Notes Clerk**
9. Is markdown too technical, or just right for legal work?
10. Should notes have version history?
11. Is the tag system sufficient, or want folders too?
12. Should notes auto-save, or require manual save?

### **General**
13. Should there be keyboard shortcuts (e.g., Cmd+N for new note)?
14. Want a global search across all clerks?
15. Should clerks remember their expanded/collapsed state?

---

## 🔄 Next Steps

### **Option 1: Iterate on these mockups**
If something doesn't feel right, tell me:
- "The sidebar is too narrow" → I'll adjust width
- "Need more spacing between tasks" → I'll increase padding
- "Tags should be more prominent" → I'll resize/recolor

### **Option 2: Build remaining 6 clerks**
Once you approve To-Do + Notes, I'll create mockups for:
- Facts Clerk (claims extraction, contradictions)
- Exhibits Clerk (document gallery, metadata)
- Discovery Clerk (interrogatories, RFPs, timeline)
- Caseblock Clerk (caption designer)
- Signature Clerk (signature block templates)
- Communication Clerk (email templates, filing tracker)
- Analysis Clerk (cite checker, document comparison)

### **Option 3: Gemini visual concepts**
If you want to explore alternative layouts/styles, we can:
- Generate visual concepts with Gemini
- Compare different approaches
- Pick the best elements from each

---

## 🎯 Design Principles Applied

These mockups follow your stated preferences:

✅ **Professional legal aesthetic** - Warm neutrals, serif headers  
✅ **Document realism** - Paper metaphor, Times New Roman in editor  
✅ **Cursor-style panels** - Expandable/collapsible sidebar system  
✅ **Subtle interactions** - Hover states, smooth transitions  
✅ **Status indicators** - Color-coded warnings (red/orange/green)  
✅ **Compact but readable** - Efficient use of space  
✅ **Consistent with existing UI** - Uses your Shell Mockup style  

---

## 📊 Clerk System Summary

**Always Visible (Top 2):**
1. 📝 To-Do Clerk
2. 💡 Notes Clerk

**Collapsed by Default (Bottom 7):**
3. 🔍 Facts Clerk
4. 📎 Exhibits Clerk
5. 📊 Discovery Clerk
6. ⚖️ Caseblock Clerk
7. ✍️ Signature Clerk
8. 📧 Communication Clerk
9. 🔬 Analysis Clerk

**Total:** 9 clerks in sidebar system

---

## 🚀 Ready for Your Review

Open the files in your browser and click around! Everything is interactive (within the limits of static HTML).

**Questions? Feedback? Changes?**

Just let me know and I'll iterate on the designs until they're exactly what you want!

---

**Status:** Mockups ready for review ✅  
**Next:** Your feedback → Iterate or build remaining clerks
