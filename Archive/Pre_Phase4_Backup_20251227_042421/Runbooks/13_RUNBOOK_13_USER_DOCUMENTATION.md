# Runbook 13: User Documentation

**Phase:** Delivery (Completion)  
**Estimated Time:** 8-12 hours  
**Prerequisites:** Runbooks 1-12 complete (tested application)  
**Depends On:** Runbook 0 Sections 12, 20  
**Enables:** User adoption, support ticket reduction, training

---

## Objective

Create **comprehensive user documentation** including user guides, video tutorials, administrator manuals, troubleshooting guides, and FAQ that enable users to effectively use FACTSWAY without extensive support.

**Success Criteria:**
- ✅ User guide covering all major workflows
- ✅ Quick start guide (<15 minutes)
- ✅ Screenshot-based tutorials
- ✅ Administrator manual for deployment
- ✅ Troubleshooting guide with common issues
- ✅ FAQ with 20+ questions
- ✅ Video tutorial scripts (for future production)
- ✅ Documentation accessible offline (bundled with app)
- ✅ Search functionality in docs

---

## Context from Runbook 0

**Referenced Sections:**
- **Section 12:** UI/UX Specifications (what to document)
- **Section 20:** Design System (for screenshot consistency)
- **Section 22.2:** Desktop Deployment (for admin docs)

**Key Principle from Runbook 0:**
> "Documentation should anticipate user questions before they're asked. A well-documented feature reduces support tickets by 80%. Every workflow should have a 'how-to' with screenshots, every error message should link to troubleshooting docs."

---

## Current State

**What exists:**
- ✅ Fully functional FACTSWAY application
- ✅ All workflows tested (Runbooks 11-12)
- ❌ No user documentation
- ❌ No admin documentation
- ❌ No troubleshooting guides
- ❌ No FAQ

**What this creates:**
- ✅ User Guide (50+ pages)
- ✅ Quick Start Guide (5 pages)
- ✅ Administrator Manual (20+ pages)
- ✅ Troubleshooting Guide (15+ pages)
- ✅ FAQ Document (20+ Q&A)
- ✅ Video Tutorial Scripts (10 videos)
- ✅ Documentation website (static HTML)
- ✅ In-app help system integration

---

## Task 1: User Guide Structure

### 1.1 User Guide Outline

**File:** `docs/user-guide/00-outline.md`

**Action:** CREATE

**Purpose:** Define complete user guide structure

**Content:**
```markdown
# FACTSWAY User Guide - Outline

## Part 1: Getting Started (15 min read)
1. Welcome to FACTSWAY
2. Installation & First Launch
3. Interface Overview
4. Core Concepts (Templates, Cases, Drafts)
5. Your First Motion

## Part 2: Working with Templates (30 min read)
6. Understanding Templates
7. Creating a Template from Scratch
8. Template Variables
9. Template Sections & Hierarchy
10. Organizing Your Templates
11. Sharing Templates (Enterprise only)

## Part 3: Managing Cases (30 min read)
12. Creating a New Case
13. Case Information & Metadata
14. Attaching Evidence to Cases
15. Case Organization
16. Case Status & Lifecycle
17. Archiving Cases

## Part 4: Drafting Documents (45 min read)
18. Creating a Draft from Template
19. The Document Editor
20. Formatting Text
21. Working with Sections
22. Using Variables
23. Inserting Citations
24. Linking Evidence
25. Cross-References
26. Saving & Version Control

## Part 5: Evidence Management (20 min read)
27. Uploading Evidence
28. Evidence Types (Exhibits, Caselaw, Statutes)
29. Organizing Evidence
30. Linking Evidence to Citations
31. Evidence Notes & Metadata

## Part 6: Exporting Documents (15 min read)
32. Export Overview
33. Previewing Exports
34. Export Settings
35. Opening Exports in Word
36. Troubleshooting Export Issues

## Part 7: Advanced Features (30 min read)
37. Keyboard Shortcuts
38. Search & Find
39. Bulk Operations
40. Custom Styles
41. Templates from Existing Documents
42. Collaboration (Enterprise only)

## Appendices
A. Keyboard Shortcuts Reference
B. Supported File Formats
C. System Requirements
D. Privacy & Data Security
E. Glossary of Terms
```

---

### 1.2 Sample Chapter: Your First Motion

**File:** `docs/user-guide/05-your-first-motion.md`

**Action:** CREATE

**Purpose:** Step-by-step tutorial for first-time users

**Content:**
```markdown
# Chapter 5: Your First Motion

**Estimated time:** 10 minutes

In this chapter, you'll create your first legal motion from start to finish. By the end, you'll have a complete Motion for Summary Judgment ready to export to Word.

---

## Step 1: Select a Template

1. Launch FACTSWAY
2. Click **Templates** in the left sidebar
3. Find "Motion for Summary Judgment - Texas District Court"
4. Click the template card to open it

![Templates View](screenshots/templates-view.png)

**What you're looking at:**
- Template cards show name, jurisdiction, and category
- Click any card to view details
- Use the search box to filter templates

---

## Step 2: Create a Case

Before you can draft a motion, you need to create a case.

1. Click **Cases** in the left sidebar
2. Click **+ New Case** (top right)
3. Fill in the case information:
   - **Template:** Motion for Summary Judgment
   - **Case Name:** Smith v. Jones
   - **Cause Number:** 2024-CV-001234
   - **Court:** District Court of Travis County, Texas
   - **Filing Date:** (today's date)

![New Case Dialog](screenshots/new-case-dialog.png)

4. Fill in required variables:
   - **Attorney Name:** (your name)
   - **Bar Number:** (your bar number)
   - **Attorney Address:** (your address)

5. Click **Create Case**

**Success!** Your case now appears in the Cases list.

---

## Step 3: Create a Draft

1. Click on your new case card
2. In the case detail view, click **+ New Draft**
3. Enter a title: "Motion for Summary Judgment - Draft 1"
4. Click **Create Draft**

![Draft Editor](screenshots/draft-editor.png)

The draft editor opens with your template content pre-filled.

---

## Step 4: Edit Your Motion

The editor works like Microsoft Word, but with special legal features.

**Edit the Introduction:**
1. Click in the Introduction section
2. Edit the text to match your case facts
3. Notice how the case name and cause number are automatically filled in from your case

**Add a fact:**
1. Scroll to the Facts section
2. Type your fact at the end of the section
3. Press Enter to create a new paragraph

![Editing Text](screenshots/editing-text.png)

---

## Step 5: Add Evidence

Let's link a piece of evidence to support your argument.

1. Click where you want to cite evidence
2. Click the **Insert Citation** button (or press Ctrl+K)
3. Select **Exhibit**
4. Type the display text: "Ex. A"
5. Click **Insert**

![Citation Unlinked](screenshots/citation-unlinked.png)

Notice the citation appears as an **amber chip** - this means it's not yet linked to actual evidence.

**Link the citation:**
1. Double-click the amber citation chip
2. Click **Upload Evidence**
3. Select a PDF from your computer
4. Add a description: "Email from opposing counsel"
5. Click **Link**

![Citation Linked](screenshots/citation-linked.png)

The citation turns **blue** - it's now linked to evidence!

---

## Step 6: Save Your Work

FACTSWAY automatically saves as you type, but you can manually save:

1. Click **Save** (top right) or press Ctrl+S
2. A green toast notification confirms: "Draft saved"

![Save Confirmation](screenshots/save-confirmation.png)

---

## Step 7: Export to Word

Your motion is ready to file. Let's export it.

1. Click **Export** (top right)
2. The export preview opens - review your document
3. Click **Download DOCX**
4. Choose where to save the file
5. Open the file in Microsoft Word

![Export Preview](screenshots/export-preview.png)

**Congratulations!** You've created your first motion with FACTSWAY.

---

## What You Learned

In this tutorial, you:
- ✅ Selected a template
- ✅ Created a case
- ✅ Created a draft
- ✅ Edited content
- ✅ Added and linked evidence
- ✅ Exported to Word

---

## Next Steps

Now that you've mastered the basics, explore:
- **Chapter 18:** Learn all editor features
- **Chapter 23:** Master citation linking
- **Chapter 32:** Advanced export options

---

## Need Help?

- Press **F1** for context-sensitive help
- Click **Help** > **User Guide** in the menu
- Visit **support.factsway.com**
```

---

## Task 2: Quick Start Guide

### 2.1 Quick Start (One-Pager)

**File:** `docs/quick-start.md`

**Action:** CREATE

**Purpose:** Get users productive in <15 minutes

**Content:**
```markdown
# FACTSWAY Quick Start Guide

**Get productive in 15 minutes**

---

## Installation

**Windows:** Run `FACTSWAY-Installer.exe` → Next → Install
**macOS:** Open `FACTSWAY.dmg` → Drag to Applications
**Linux:** Make executable and run `FACTSWAY.AppImage`

---

## Your First Document in 5 Steps

### Step 1: Create a Case (2 min)

1. Click **Cases** → **+ New Case**
2. Fill in:
   - Case Name: "Smith v. Jones"
   - Cause Number: "2024-CV-001234"
   - Court Name: "District Court"
3. Click **Create Case**

### Step 2: Create a Draft (1 min)

1. Click your case card
2. Click **+ New Draft**
3. Enter title: "Motion for Summary Judgment"
4. Click **Create Draft**

### Step 3: Edit Content (5 min)

1. Click in the editor and type
2. Use toolbar for **bold**, _italic_, headings
3. Insert citations: Ctrl+K

### Step 4: Add Evidence (3 min)

1. Type text: "As shown in "
2. Press Ctrl+K → Select **Exhibit**
3. Type "Ex. A" → Insert
4. Double-click the amber chip
5. Upload your PDF
6. Click **Link**

The chip turns blue ✓

### Step 5: Export (2 min)

1. Click **Export** → Review preview
2. Click **Download DOCX**
3. Open in Microsoft Word

**Done!** You've created a legal motion.

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save | Ctrl+S |
| Insert Citation | Ctrl+K |
| Bold | Ctrl+B |
| Italic | Ctrl+I |
| Find | Ctrl+F |
| Export | Ctrl+E |

---

## Get Help

- Press **F1** for context help
- **Help** → **User Guide**
- Visit **docs.factsway.com**
```

---

## Task 3: Administrator Manual

### 3.1 Admin Manual Outline

**File:** `docs/admin-manual/00-outline.md`

**Action:** CREATE

**Content:**
```markdown
# FACTSWAY Administrator Manual - Outline

## Part 1: Installation & Deployment
1. System Requirements
2. Desktop Installation
3. Enterprise Deployment (Docker Compose)
4. Cloud Deployment (Kubernetes)
5. Network Configuration
6. Firewall Rules
7. SSL/TLS Setup

## Part 2: Configuration
8. Environment Variables
9. Database Configuration
10. Service Configuration
11. Logging Configuration
12. Performance Tuning
13. Backup Configuration

## Part 3: User Management (Enterprise)
14. Creating Users
15. Roles & Permissions
16. SSO Integration (SAML/OAuth)
17. Password Policies
18. User Deactivation

## Part 4: Maintenance
19. Database Backups
20. Log Rotation
21. Disk Space Management
22. Service Health Monitoring
23. Software Updates
24. Migration Procedures

## Part 5: Troubleshooting
25. Service Diagnostics
26. Database Issues
27. Performance Problems
28. Network Issues
29. Export Failures

## Part 6: Security
30. Security Best Practices
31. Data Encryption
32. Access Control
33. Audit Logging
34. Compliance (GDPR, HIPAA, etc.)

## Appendices
A. Environment Variables Reference
B. API Documentation
C. Database Schema
D. Service Ports
E. Error Codes Reference
```

---

### 3.2 Sample Chapter: Desktop Installation

**File:** `docs/admin-manual/02-desktop-installation.md`

**Action:** CREATE

**Content:**
```markdown
# Chapter 2: Desktop Installation

This chapter covers installing FACTSWAY Desktop on user workstations.

---

## System Requirements

### Minimum Requirements

- **OS:** Windows 10 (64-bit), macOS 10.15+, Ubuntu 20.04+
- **RAM:** 4 GB
- **Disk:** 500 MB free space
- **Network:** Internet connection for updates (optional)

### Recommended Requirements

- **OS:** Windows 11, macOS 13+, Ubuntu 22.04+
- **RAM:** 8 GB
- **Disk:** 2 GB free space
- **Display:** 1920x1080 or higher

---

## Windows Installation

### Standard Installation

1. Download `FACTSWAY-1.0.0-win-x64.exe`
2. Double-click the installer
3. Click **Next** through the wizard
4. Choose installation directory (default: `C:\Program Files\FACTSWAY`)
5. Select **Create Desktop Shortcut** (recommended)
6. Click **Install**
7. Click **Finish** to launch FACTSWAY

### Silent Installation (IT Departments)

```cmd
FACTSWAY-1.0.0-win-x64.exe /S /D=C:\Program Files\FACTSWAY
```

### Group Policy Deployment

1. Copy installer to network share: `\\server\software\FACTSWAY\`
2. Create GPO: Computer Configuration → Software Settings → Software Installation
3. Add new package → Point to installer
4. Select **Assigned**
5. Push to target OUs

---

## macOS Installation

### Standard Installation

1. Download `FACTSWAY-1.0.0-mac-x64.dmg`
2. Double-click the DMG file
3. Drag **FACTSWAY.app** to **Applications** folder
4. Eject the DMG
5. Open **Applications** → Double-click **FACTSWAY**

**First Launch:** You may see "FACTSWAY cannot be opened because it is from an unidentified developer"
- Right-click FACTSWAY → **Open**
- Click **Open** in the dialog

### MDM Deployment (Jamf, Intune)

```bash
# Deploy via script
hdiutil attach FACTSWAY-1.0.0-mac-x64.dmg
cp -R /Volumes/FACTSWAY/FACTSWAY.app /Applications/
hdiutil detach /Volumes/FACTSWAY
```

---

## Linux Installation

### AppImage (Ubuntu, Fedora)

1. Download `FACTSWAY-1.0.0-linux-x64.AppImage`
2. Make executable:
   ```bash
   chmod +x FACTSWAY-1.0.0-linux-x64.AppImage
   ```
3. Run:
   ```bash
   ./FACTSWAY-1.0.0-linux-x64.AppImage
   ```

### Debian Package (Ubuntu, Debian)

```bash
sudo dpkg -i FACTSWAY-1.0.0-amd64.deb
sudo apt-get install -f
```

### System-wide Installation

```bash
sudo mv FACTSWAY-1.0.0-linux-x64.AppImage /usr/local/bin/factsway
sudo chmod +x /usr/local/bin/factsway
```

---

## Post-Installation

### Data Location

User data is stored in:
- **Windows:** `C:\Users\<username>\AppData\Roaming\FACTSWAY`
- **macOS:** `~/Library/Application Support/FACTSWAY`
- **Linux:** `~/.config/FACTSWAY`

### Auto-Updates

FACTSWAY checks for updates on launch. Updates download in background.

**Disable auto-updates:** Set environment variable
```
FACTSWAY_AUTO_UPDATE=false
```

### Logs Location

- **Windows:** `%APPDATA%\FACTSWAY\logs`
- **macOS:** `~/Library/Logs/FACTSWAY`
- **Linux:** `~/.config/FACTSWAY/logs`

---

## Uninstallation

### Windows

1. Control Panel → Programs → Uninstall a Program
2. Select **FACTSWAY** → Uninstall
3. Choose whether to keep user data

### macOS

1. Open **Applications**
2. Drag **FACTSWAY** to Trash
3. Empty Trash

To remove user data:
```bash
rm -rf ~/Library/Application Support/FACTSWAY
```

### Linux

```bash
# AppImage - just delete the file
rm /usr/local/bin/factsway

# Debian package
sudo apt remove factsway
```

---

## Troubleshooting Installation

### Windows: "Windows protected your PC"

**Cause:** App is not code-signed with Microsoft certificate
**Solution:** Click **More info** → **Run anyway**

### macOS: "damaged and can't be opened"

**Cause:** Gatekeeper quarantine
**Solution:**
```bash
xattr -cr /Applications/FACTSWAY.app
```

### Linux: "cannot execute binary file"

**Cause:** Downloaded 32-bit version on 64-bit system
**Solution:** Download correct architecture (x64)

---

## Next Steps

- **Chapter 3:** Enterprise Deployment
- **Chapter 9:** Service Configuration
- **Chapter 19:** Database Backups
```

---

## Task 4: Troubleshooting Guide

### 4.1 Common Issues Document

**File:** `docs/troubleshooting.md`

**Action:** CREATE

**Purpose:** Solutions to common problems

**Content:**
```markdown
# FACTSWAY Troubleshooting Guide

Quick solutions to common problems.

---

## Installation Issues

### Problem: Windows installation fails with "Access Denied"

**Symptoms:** Installer shows error during installation
**Cause:** Insufficient permissions
**Solution:**
1. Right-click installer
2. Select **Run as Administrator**
3. Complete installation

---

### Problem: macOS won't open app - "unidentified developer"

**Symptoms:** Security warning on first launch
**Cause:** App not downloaded from App Store
**Solution:**
1. Right-click **FACTSWAY.app**
2. Click **Open**
3. Click **Open** in dialog
4. (Alternative) System Preferences → Security → **Open Anyway**

---

## Application Issues

### Problem: App won't launch - spinning wheel then crash

**Symptoms:** App starts but crashes immediately
**Cause:** Corrupt user data or service startup failure
**Solution:**
1. Check logs: `~/Library/Logs/FACTSWAY` (macOS)
2. Look for service errors
3. Reset app data:
   ```bash
   # macOS
   rm -rf ~/Library/Application Support/FACTSWAY
   ```
4. Restart app

---

### Problem: "Service Unavailable" error

**Symptoms:** Red banner: "Records Service unavailable"
**Cause:** Backend service failed to start
**Solution:**
1. Restart FACTSWAY
2. If persists, check port conflicts:
   ```bash
   # macOS/Linux
   lsof -i :3001-3008
   
   # Windows
   netstat -ano | findstr :3001
   ```
3. Kill conflicting processes
4. Restart FACTSWAY

---

## Document Editor Issues

### Problem: Can't type in editor

**Symptoms:** Click in editor but cursor doesn't appear
**Cause:** Editor not initialized
**Solution:**
1. Close and reopen the draft
2. If persists, clear cache:
   - Help → Clear Cache
   - Restart app

---

### Problem: Citations show as amber (unlinked) after linking

**Symptoms:** Linked citation turns blue, then back to amber after save
**Cause:** Evidence linking not persisted
**Solution:**
1. Check evidence was uploaded successfully
2. Re-link the citation
3. Save explicitly (Ctrl+S)
4. Reload draft to verify

---

### Problem: Formatting lost after export to Word

**Symptoms:** DOCX doesn't match preview
**Cause:** Custom styles not exported
**Solution:**
1. Use only built-in styles (Heading 1, Normal, etc.)
2. Avoid manual formatting (use toolbar instead)
3. Re-export

---

## Evidence Issues

### Problem: Can't upload evidence - "File too large"

**Symptoms:** Upload fails with size error
**Cause:** File exceeds 50MB limit
**Solution:**
1. Compress PDF (Adobe Acrobat → Reduce File Size)
2. Split large files into multiple exhibits
3. Remove embedded images/fonts if possible

---

### Problem: Uploaded evidence not visible in list

**Symptoms:** Upload succeeds but file doesn't appear
**Cause:** UI refresh needed
**Solution:**
1. Click **Refresh** or navigate away and back
2. If not visible, check:
   - Evidence → All (not just Exhibits)
   - Search filter is not active

---

## Export Issues

### Problem: Export fails with "Unknown error"

**Symptoms:** Export button shows loading, then error
**Cause:** Malformed document structure
**Solution:**
1. Check for broken citations (red strikethrough)
2. Remove problematic sections
3. Try exporting incrementally (disable sections)
4. Contact support with draft ID

---

### Problem: Exported DOCX won't open in Word

**Symptoms:** Word shows "file is corrupted"
**Cause:** Incomplete export or network interruption
**Solution:**
1. Re-export document
2. Verify file size (should be >5KB)
3. Try opening in Google Docs
4. If issue persists, export to PDF instead

---

## Performance Issues

### Problem: App is slow / freezing

**Symptoms:** UI unresponsive, typing lags
**Cause:** Large database or memory leak
**Solution:**
1. Close unused drafts/cases
2. Archive old cases
3. Clear cache: Help → Clear Cache
4. Restart app
5. If persists, check system resources:
   - Task Manager (Windows)
   - Activity Monitor (macOS)

---

### Problem: Export takes >30 seconds

**Symptoms:** Export preview slow to generate
**Cause:** Large document with many citations
**Solution:**
1. This is normal for 50+ page documents
2. Export in sections if possible
3. Reduce embedded images

---

## Database Issues

### Problem: "Database locked" error

**Symptoms:** Can't save, error message shown
**Cause:** Multiple instances or backup in progress
**Solution:**
1. Close all FACTSWAY windows
2. Verify only one instance running
3. Restart app
4. If persists, restart computer

---

### Problem: Lost work after crash

**Symptoms:** Draft reverted to old version
**Cause:** Auto-save failed or disabled
**Solution:**
1. Check auto-save enabled: Preferences → Auto-save every 30s
2. Enable version history: Preferences → Keep all versions
3. Manually save frequently (Ctrl+S)

**Recovery:**
1. File → Version History
2. Find pre-crash version
3. Restore

---

## Update Issues

### Problem: Update download fails

**Symptoms:** "Update available" but download stalls
**Cause:** Network issue or firewall
**Solution:**
1. Check internet connection
2. Disable VPN temporarily
3. Manually download from factsway.com
4. Install manually

---

### Problem: App broken after update

**Symptoms:** Update installs but app won't launch
**Cause:** Incompatible update or corrupt install
**Solution:**
1. Uninstall app
2. Delete app data (see Uninstallation guide)
3. Download fresh installer
4. Reinstall

---

## Getting More Help

If your issue isn't listed here:

1. Check logs:
   - macOS: `~/Library/Logs/FACTSWAY/main.log`
   - Windows: `%APPDATA%\FACTSWAY\logs\main.log`
   - Linux: `~/.config/FACTSWAY/logs/main.log`

2. Collect diagnostic info:
   - Help → Generate Diagnostic Report
   - Save report ZIP file

3. Contact support:
   - Email: support@factsway.com
   - Attach diagnostic report
   - Include steps to reproduce

---

## Known Issues

### Windows: Port 3001 conflict with IIS

**Workaround:** Stop IIS or configure FACTSWAY to use different ports

### macOS Ventura: Slow first launch

**Workaround:** Normal - macOS validates app signature. Subsequent launches faster.

### Linux: AppImage requires FUSE

**Workaround:** Install FUSE: `sudo apt install libfuse2`
```

---

## Task 5: FAQ Document

### 5.1 Frequently Asked Questions

**File:** `docs/faq.md`

**Action:** CREATE

**Content:**
```markdown
# Frequently Asked Questions (FAQ)

---

## General Questions

**Q: What is FACTSWAY?**
A: FACTSWAY is a legal document drafting platform designed for pro se litigants and solo practitioners. It helps you create professional legal motions with evidence linking, citation management, and Word export.

**Q: How much does it cost?**
A: FACTSWAY Desktop is $50/month with a 14-day free trial. Enterprise pricing available.

**Q: What platforms are supported?**
A: Windows 10+, macOS 10.15+, Ubuntu 20.04+ (and most Linux distributions).

**Q: Do I need Microsoft Word?**
A: No. FACTSWAY exports to .docx format which can be opened in Word, Google Docs, LibreOffice, or any word processor.

**Q: Is my data private?**
A: Yes. Desktop version stores all data locally on your computer. We never see your documents.

**Q: Can I use FACTSWAY offline?**
A: Yes. Desktop version works completely offline. Updates require internet connection.

---

## Documents & Drafting

**Q: How many documents can I create?**
A: Unlimited. No restrictions on templates, cases, or drafts.

**Q: Can I import my existing Word documents?**
A: Yes. File → Import Document → Select .docx file. FACTSWAY will parse it into sections.

**Q: Can multiple people work on the same document?**
A: In Desktop version, no (single-user). Enterprise version supports collaboration.

**Q: What citation styles are supported?**
A: Bluebook (default), ALWD, local rules variants. Citation formatting applied at export.

**Q: Can I create custom templates?**
A: Yes. Templates → + New Template. Build from scratch or import existing documents.

---

## Evidence & Citations

**Q: What file formats can I upload as evidence?**
A: PDF (recommended), images (JPG, PNG), Word documents (.docx). Max 50MB per file.

**Q: How do I cite caselaw?**
A: Insert Citation → Caselaw → Enter case name and citation. Optional: Link to full opinion PDF.

**Q: Can I cite the same exhibit multiple times?**
A: Yes. Insert citation, link to same exhibit. All instances update if you change exhibit number.

**Q: What happens to evidence when I export?**
A: Citations appear as formatted text in Word. Evidence files must be filed separately per court rules.

---

## Export & Formatting

**Q: Can I edit the exported Word document?**
A: Yes. Exported .docx is fully editable in Word. Changes won't sync back to FACTSWAY.

**Q: Why doesn't my Word doc match the preview?**
A: Check Word version. FACTSWAY targets Word 2016+. Older versions may render differently.

**Q: Can I export to PDF?**
A: Export to .docx first, then use Word/Google Docs to save as PDF. Direct PDF export coming soon.

**Q: How do I add a signature line?**
A: Signature block is in template. Variables: `{{attorney_name}}`, `{{bar_number}}`, etc.

---

## Technical Questions

**Q: How do I back up my data?**
A: Data is in:
- macOS: `~/Library/Application Support/FACTSWAY`
- Windows: `%APPDATA%\FACTSWAY`
- Linux: `~/.config/FACTSWAY`

Copy this folder to backup. Restore by copying back.

**Q: Can I sync between computers?**
A: Not in Desktop version. Copy data folder manually or use Enterprise (cloud sync).

**Q: What are the service ports for?**
A: FACTSWAY runs 8 background services (ports 3001-3008). Needed for app to function. No external network access.

**Q: Is FACTSWAY HIPAA compliant?**
A: Desktop version is local-only (compliant by design). Enterprise version has BAA available.

---

## Subscription & Licensing

**Q: Can I use one license on multiple computers?**
A: One license = one user = one computer at a time. Multi-computer use requires additional licenses.

**Q: What happens if I cancel my subscription?**
A: App continues working but updates/support stop. Data remains accessible (read-only after 30 days).

**Q: Is there a lifetime license option?**
A: Not currently. Subscribe annually for discount (save 15%).

**Q: Do you offer non-profit discounts?**
A: Yes. 50% discount for verified 501(c)(3) organizations. Contact sales@factsway.com.

---

## Troubleshooting

**Q: App won't launch - what do I do?**
A: See [Troubleshooting Guide](troubleshooting.md) → Application Issues

**Q: I lost my work after a crash - can I recover it?**
A: File → Version History. Select pre-crash version → Restore.

**Q: Citations aren't linking - help!**
A: Double-click amber citation chip → Upload Evidence → Link. Citation turns blue when linked.

**Q: Export fails - what's wrong?**
A: Check for red (broken) cross-references. Fix or remove them. See [Troubleshooting Guide](troubleshooting.md) → Export Issues.

---

## Still Have Questions?

- **User Guide:** Help → User Guide (F1)
- **Video Tutorials:** docs.factsway.com/videos
- **Email Support:** support@factsway.com
- **Live Chat:** factsway.com (business hours)
```

---

## Verification

**From Runbook 0 Section 19.13:**

### Verification Checklist

**User Guide:**
- [ ] All 7 parts outlined
- [ ] 40+ chapters planned
- [ ] Sample chapter complete
- [ ] Screenshots placeholders included
- [ ] Glossary defined
- [ ] Index created

**Quick Start:**
- [ ] <15 minute read time
- [ ] 5 clear steps
- [ ] Screenshots included
- [ ] Keyboard shortcuts listed
- [ ] Help links provided

**Administrator Manual:**
- [ ] All deployment types covered
- [ ] Installation guides for 3 platforms
- [ ] Configuration documented
- [ ] Troubleshooting included
- [ ] Security best practices

**Troubleshooting:**
- [ ] 20+ common issues
- [ ] Clear symptoms for each
- [ ] Step-by-step solutions
- [ ] Log locations documented
- [ ] Support escalation path

**FAQ:**
- [ ] 25+ questions answered
- [ ] Organized by topic
- [ ] Links to detailed docs
- [ ] Contact information

**Accessibility:**
- [ ] Docs bundled with app
- [ ] Offline access works
- [ ] Search functionality
- [ ] Mobile-friendly (HTML)
- [ ] Printable versions (PDF)

---

## Success Criteria

✅ User guide covers all workflows
✅ Quick start gets users productive in <15 min
✅ Admin manual supports deployment
✅ Troubleshooting solves 80% of issues
✅ FAQ answers common questions
✅ Docs accessible offline
✅ Screenshots consistent with Design System
✅ Search works across all docs

---

## Next Steps

After Runbook 13 completes:

1. **Runbook 14:** CI/CD Pipelines
2. **Runbook 15:** Production Deployment

---

## Reference

**Runbook 0 Sections:**
- Section 12: UI/UX Specifications
- Section 20: Design System

**Dependencies:**
- Runbooks 1-12: Complete, tested application

---

**End of Runbook 13**
