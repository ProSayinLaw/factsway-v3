# Runbook 11: End-to-End Testing Suite

**Phase:** Quality Assurance (Critical Path)  
**Estimated Time:** 8-12 hours  
**Prerequisites:** Runbooks 1-10 complete (buildable desktop app)  
**Depends On:** Runbook 0 Sections 18, 19  
**Enables:** Runbook 12 (integration testing), production confidence

---

## Objective

Create **comprehensive End-to-End (E2E) testing suite** using Playwright that validates complete user workflows in the FACTSWAY desktop application, from Template creation through Draft export.

**Success Criteria:**
- ✅ Playwright configured for Electron testing
- ✅ All 8 critical user workflows have E2E tests
- ✅ Tests run against packaged application
- ✅ Visual regression testing configured
- ✅ Evidence linking workflow tested
- ✅ Export workflow validated (DOCX output)
- ✅ Tests pass in CI environment
- ✅ Test report generation working
- ✅ Headless and headed modes supported

---

## Context from Runbook 0

**Referenced Sections:**
- **Section 18:** Testing Strategy
  - **Section 18.1:** Testing pyramid (E2E at top)
  - **Section 18.2:** Critical user flows
  - **Section 18.3:** Test data management
  - **Section 18.4:** Regression prevention
- **Section 19:** Quality Assurance
  - **Section 19.1-19.10:** Verification criteria for each runbook
  - **Section 19.11:** Integration testing requirements
  - **Section 19.12:** Performance benchmarks

**Key Principle from Runbook 0:**
> "E2E tests validate complete user workflows, not isolated features. A test should simulate what a real user would do: create a case, draft a motion, link evidence, export to Word. If the test passes, we have high confidence the feature works end-to-end."

---

## Current State

**What exists:**
- ✅ Complete desktop application (Runbooks 1-10)
- ✅ All 8 backend services operational
- ✅ Renderer with Tiptap editor
- ✅ Packaged installers for all platforms
- ❌ No E2E test framework
- ❌ No test fixtures or data
- ❌ No CI test configuration
- ❌ No visual regression baseline

**What this creates:**
- ✅ Playwright test framework for Electron
- ✅ 8 critical workflow test suites
- ✅ Test fixtures and mock data generators
- ✅ Visual regression testing (screenshots)
- ✅ CI/CD test runner configuration
- ✅ Test report dashboard
- ✅ Debugging utilities (traces, videos)
- ✅ Performance measurement helpers

---

## Task 1: Playwright Setup for Electron

### 1.1 Install Playwright Dependencies

**File:** `e2e-tests/package.json`

**Action:** CREATE

**Content:**
```json
{
  "name": "factsway-e2e-tests",
  "version": "1.0.0",
  "description": "End-to-End tests for FACTSWAY Desktop",
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:ui": "playwright test --ui",
    "test:report": "playwright show-report",
    "test:update-snapshots": "playwright test --update-snapshots"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@types/node": "^20.10.6",
    "typescript": "^5.3.3"
  }
}
```

---

### 1.2 Playwright Configuration

**File:** `e2e-tests/playwright.config.ts`

**Action:** CREATE

**Purpose:** Configure Playwright for Electron testing

**Content:**
```typescript
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright Configuration for FACTSWAY Desktop E2E Tests
 * 
 * Reference: Runbook 0 Section 18.1
 * 
 * Tests run against packaged Electron app to ensure
 * production behavior matches test expectations.
 */
export default defineConfig({
  testDir: './tests',
  
  // Test timeout (5 minutes per test)
  timeout: 5 * 60 * 1000,
  
  // Expect timeout (10 seconds for assertions)
  expect: {
    timeout: 10000
  },
  
  // Fail fast on first failure (for CI)
  fullyParallel: false,
  
  // Retry failed tests once
  retries: process.env.CI ? 2 : 0,
  
  // Number of parallel workers
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/html' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],
  
  // Shared settings for all tests
  use: {
    // Base URL (not used for Electron)
    // baseURL: 'http://localhost:5173',
    
    // Collect traces on first retry
    trace: 'on-first-retry',
    
    // Screenshots on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Viewport (Electron window size)
    viewport: { width: 1280, height: 720 }
  },
  
  // Test projects (different scenarios)
  projects: [
    {
      name: 'electron-main',
      testMatch: '**/*.spec.ts',
      use: {
        // Electron-specific launch options set in global setup
      }
    },
    
    {
      name: 'visual-regression',
      testMatch: '**/visual/*.spec.ts',
      use: {
        // Visual comparison with pixel-perfect screenshots
      }
    }
  ],
  
  // Output folder for test artifacts
  outputDir: 'test-results/artifacts'
});
```

---

### 1.3 Electron Test Utilities

**File:** `e2e-tests/utils/electron.ts`

**Action:** CREATE

**Purpose:** Utilities for launching and controlling Electron app

**Content:**
```typescript
import { _electron as electron, ElectronApplication, Page } from 'playwright';
import path from 'path';
import { test as base } from '@playwright/test';

/**
 * Electron App Launcher
 * 
 * Launches packaged FACTSWAY Electron app for testing.
 * Handles platform-specific executable paths.
 */
export async function launchElectronApp(): Promise<ElectronApplication> {
  // Determine executable path based on platform
  const platform = process.platform;
  let executablePath: string;
  
  if (platform === 'darwin') {
    // macOS
    executablePath = path.join(
      __dirname,
      '../../desktop/dist-electron/mac/FACTSWAY.app/Contents/MacOS/FACTSWAY'
    );
  } else if (platform === 'win32') {
    // Windows
    executablePath = path.join(
      __dirname,
      '../../desktop/dist-electron/win-unpacked/FACTSWAY.exe'
    );
  } else {
    // Linux
    executablePath = path.join(
      __dirname,
      '../../desktop/dist-electron/linux-unpacked/factsway'
    );
  }
  
  // Launch Electron app
  const app = await electron.launch({
    executablePath,
    args: [
      // Pass test mode flag
      '--test-mode'
    ],
    env: {
      // Set test environment variables
      NODE_ENV: 'test',
      LOG_LEVEL: 'debug'
    }
  });
  
  // Wait for app to be ready
  await app.firstWindow();
  
  return app;
}

/**
 * Get main window from Electron app
 */
export async function getMainWindow(app: ElectronApplication): Promise<Page> {
  const window = await app.firstWindow();
  await window.waitForLoadState('domcontentloaded');
  return window;
}

/**
 * Custom test fixture with Electron app
 * 
 * Automatically launches app before each test and closes after.
 */
export const test = base.extend<{
  electronApp: ElectronApplication;
  mainWindow: Page;
}>({
  electronApp: async ({}, use) => {
    const app = await launchElectronApp();
    await use(app);
    await app.close();
  },
  
  mainWindow: async ({ electronApp }, use) => {
    const window = await getMainWindow(electronApp);
    await use(window);
  }
});

export { expect } from '@playwright/test';
```

---

## Task 2: Test Fixtures and Data Generators

### 2.1 Test Data Fixtures

**File:** `e2e-tests/fixtures/test-data.ts`

**Action:** CREATE

**Purpose:** Mock data generators for consistent test data

**Content:**
```typescript
import type { Template, Case, Draft } from '@factsway/shared-types';

/**
 * Test Data Generators
 * 
 * Reference: Runbook 0 Section 18.3
 * 
 * Creates consistent test data for E2E tests.
 * All data is deterministic (same input = same output).
 */

/**
 * Generate mock Template
 */
export function createMockTemplate(overrides?: Partial<Template>): Template {
  return {
    id: 'test-template-001',
    name: 'Test Motion for Summary Judgment',
    category: 'motion',
    jurisdiction: 'Texas',
    court_level: 'district',
    description: 'Template for testing MSJ workflow',
    document_json: {
      sections: [
        {
          id: 'section-001',
          level: 1,
          number: '1',
          title: 'Introduction',
          content: [
            {
              type: 'paragraph',
              id: 'para-001',
              text: 'This is a test motion for summary judgment.'
            }
          ]
        }
      ],
      caseblock: {
        case_name: '{{case_name}}',
        cause_number: '{{cause_number}}',
        court_name: '{{court_name}}'
      },
      signature: {
        attorney_name: '{{attorney_name}}',
        bar_number: '{{bar_number}}'
      }
    },
    variables: {
      case_name: { type: 'text', label: 'Case Name', required: true },
      cause_number: { type: 'text', label: 'Cause Number', required: true },
      court_name: { type: 'text', label: 'Court Name', required: true },
      attorney_name: { type: 'text', label: 'Attorney Name', required: true },
      bar_number: { type: 'text', label: 'Bar Number', required: true }
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides
  };
}

/**
 * Generate mock Case
 */
export function createMockCase(overrides?: Partial<Case>): Case {
  return {
    id: 'test-case-001',
    template_id: 'test-template-001',
    case_name: 'Smith v. Jones',
    cause_number: '2024-CV-001234',
    court_name: 'District Court of Travis County, Texas',
    filing_date: '2024-01-15',
    status: 'active',
    variable_values: {
      case_name: 'Smith v. Jones',
      cause_number: '2024-CV-001234',
      court_name: 'District Court of Travis County, Texas',
      attorney_name: 'John Doe',
      bar_number: '12345678'
    },
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    ...overrides
  };
}

/**
 * Generate mock Draft
 */
export function createMockDraft(overrides?: Partial<Draft>): Draft {
  return {
    id: 'test-draft-001',
    case_id: 'test-case-001',
    title: 'Motion for Summary Judgment - Draft 1',
    document_json: {
      sections: [
        {
          id: 'section-001',
          level: 1,
          number: '1',
          title: 'Introduction',
          content: [
            {
              type: 'paragraph',
              id: 'para-001',
              text: 'This motion seeks summary judgment on all claims.'
            }
          ]
        },
        {
          id: 'section-002',
          level: 1,
          number: '2',
          title: 'Facts',
          content: [
            {
              type: 'paragraph',
              id: 'para-002',
              text: 'The undisputed facts are as follows:'
            }
          ]
        }
      ],
      caseblock: {
        case_name: 'Smith v. Jones',
        cause_number: '2024-CV-001234',
        court_name: 'District Court of Travis County, Texas'
      },
      signature: {
        attorney_name: 'John Doe',
        bar_number: '12345678'
      }
    },
    version: 1,
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
    ...overrides
  };
}

/**
 * Sample DOCX file for ingestion testing
 * 
 * Returns base64-encoded minimal valid DOCX
 */
export function createSampleDocx(): string {
  // This would be a real base64-encoded DOCX file
  // For testing, we can use a minimal valid DOCX
  return 'UEsDBBQABgAIAAAAIQD...'; // Base64 DOCX data
}
```

---

## Task 3: Critical Workflow Tests

### 3.1 Template Creation Workflow

**File:** `e2e-tests/tests/01-template-creation.spec.ts`

**Action:** CREATE

**Purpose:** Test Template creation from scratch

**Content:**
```typescript
import { test, expect } from '../utils/electron';
import { createMockTemplate } from '../fixtures/test-data';

/**
 * E2E Test: Template Creation Workflow
 * 
 * Reference: Runbook 0 Section 18.2.1
 * 
 * Validates that users can:
 * 1. Navigate to Templates view
 * 2. Click "New Template"
 * 3. Fill in template metadata
 * 4. Add sections and content
 * 5. Define variables
 * 6. Save template
 * 7. See template in list
 */
test.describe('Template Creation Workflow', () => {
  test('should create new template successfully', async ({ mainWindow }) => {
    // Step 1: Navigate to Templates
    await mainWindow.click('nav >> text=Templates');
    await expect(mainWindow.locator('h1')).toContainText('Templates');
    
    // Step 2: Click New Template button
    await mainWindow.click('button:has-text("+ New Template")');
    
    // Modal should open
    await expect(mainWindow.locator('[role="dialog"]')).toBeVisible();
    await expect(mainWindow.locator('.modal-title')).toContainText('Create New Template');
    
    // Step 3: Fill in metadata
    await mainWindow.fill('input[name="name"]', 'Test Motion for Summary Judgment');
    await mainWindow.selectOption('select[name="category"]', 'motion');
    await mainWindow.selectOption('select[name="jurisdiction"]', 'Texas');
    await mainWindow.selectOption('select[name="court_level"]', 'district');
    await mainWindow.fill('textarea[name="description"]', 'Template for testing');
    
    // Step 4: Click Create
    await mainWindow.click('button:has-text("Create Template")');
    
    // Should navigate to template editor
    await expect(mainWindow.locator('.template-editor')).toBeVisible();
    
    // Step 5: Add a section
    await mainWindow.click('button:has-text("Add Section")');
    await mainWindow.fill('.section-title-input', 'Introduction');
    
    // Step 6: Add content to section
    await mainWindow.click('.tiptap-editor');
    await mainWindow.type('.tiptap-editor', 'This is a test motion for summary judgment.');
    
    // Step 7: Define a variable
    await mainWindow.click('button:has-text("Add Variable")');
    await mainWindow.fill('input[name="variable-name"]', 'case_name');
    await mainWindow.fill('input[name="variable-label"]', 'Case Name');
    await mainWindow.check('input[name="variable-required"]');
    await mainWindow.click('button:has-text("Save Variable")');
    
    // Step 8: Save template
    await mainWindow.click('button:has-text("Save Template")');
    
    // Should show success message
    await expect(mainWindow.locator('.toast-success')).toBeVisible();
    await expect(mainWindow.locator('.toast-success')).toContainText('Template saved');
    
    // Step 9: Navigate back to Templates list
    await mainWindow.click('nav >> text=Templates');
    
    // New template should appear in list
    await expect(mainWindow.locator('.template-card:has-text("Test Motion for Summary Judgment")')).toBeVisible();
  });
  
  test('should validate required fields', async ({ mainWindow }) => {
    await mainWindow.click('nav >> text=Templates');
    await mainWindow.click('button:has-text("+ New Template")');
    
    // Try to create without filling required fields
    await mainWindow.click('button:has-text("Create Template")');
    
    // Should show validation errors
    await expect(mainWindow.locator('.field-error:has-text("Name is required")')).toBeVisible();
    await expect(mainWindow.locator('.field-error:has-text("Category is required")')).toBeVisible();
  });
});
```

---

### 3.2 Case Creation from Template

**File:** `e2e-tests/tests/02-case-creation.spec.ts`

**Action:** CREATE

**Purpose:** Test Case creation from Template

**Content:**
```typescript
import { test, expect } from '../utils/electron';

/**
 * E2E Test: Case Creation from Template
 * 
 * Reference: Runbook 0 Section 18.2.2
 * 
 * Validates that users can:
 * 1. Select a template
 * 2. Create a case from it
 * 3. Fill in variable values
 * 4. Save the case
 * 5. See case in case list
 */
test.describe('Case Creation Workflow', () => {
  test('should create case from template', async ({ mainWindow }) => {
    // Step 1: Navigate to Cases
    await mainWindow.click('nav >> text=Cases');
    await expect(mainWindow.locator('h1')).toContainText('Cases');
    
    // Step 2: Click New Case
    await mainWindow.click('button:has-text("+ New Case")');
    
    // Modal opens
    await expect(mainWindow.locator('[role="dialog"]')).toBeVisible();
    
    // Step 3: Select template
    await mainWindow.selectOption('select[name="template"]', { label: /Motion for Summary Judgment/ });
    
    // Step 4: Fill in case metadata
    await mainWindow.fill('input[name="case_name"]', 'Smith v. Jones');
    await mainWindow.fill('input[name="cause_number"]', '2024-CV-001234');
    await mainWindow.fill('input[name="court_name"]', 'District Court of Travis County, Texas');
    await mainWindow.fill('input[name="filing_date"]', '2024-01-15');
    
    // Step 5: Fill in template variables
    await mainWindow.fill('input[name="var-attorney_name"]', 'John Doe');
    await mainWindow.fill('input[name="var-bar_number"]', '12345678');
    
    // Step 6: Create case
    await mainWindow.click('button:has-text("Create Case")');
    
    // Should navigate to case detail view
    await expect(mainWindow.locator('.case-detail')).toBeVisible();
    await expect(mainWindow.locator('h2')).toContainText('Smith v. Jones');
    
    // Step 7: Verify case appears in list
    await mainWindow.click('nav >> text=Cases');
    await expect(mainWindow.locator('.case-card:has-text("Smith v. Jones")')).toBeVisible();
    await expect(mainWindow.locator('.case-card:has-text("2024-CV-001234")')).toBeVisible();
  });
  
  test('should validate required variables', async ({ mainWindow }) => {
    await mainWindow.click('nav >> text=Cases');
    await mainWindow.click('button:has-text("+ New Case")');
    
    // Select template with required variables
    await mainWindow.selectOption('select[name="template"]', { label: /Motion/ });
    
    // Fill partial data
    await mainWindow.fill('input[name="case_name"]', 'Test Case');
    // Skip required variables
    
    // Try to create
    await mainWindow.click('button:has-text("Create Case")');
    
    // Should show validation errors
    await expect(mainWindow.locator('.field-error')).toContainText('required');
  });
});
```

---

### 3.3 Draft Editor with Evidence Linking

**File:** `e2e-tests/tests/03-draft-editing.spec.ts`

**Action:** CREATE

**Purpose:** Test Draft editing and evidence linking

**Content:**
```typescript
import { test, expect } from '../utils/electron';

/**
 * E2E Test: Draft Editing & Evidence Linking
 * 
 * Reference: Runbook 0 Section 18.2.3
 * 
 * Validates the core editing workflow:
 * 1. Open draft in editor
 * 2. Edit text with Tiptap
 * 3. Insert citation nodes
 * 4. Link evidence to citations
 * 5. Verify citation color changes (amber → blue)
 * 6. Save draft
 * 7. Reload and verify persistence
 */
test.describe('Draft Editing Workflow', () => {
  test('should edit draft and link evidence', async ({ mainWindow }) => {
    // Navigate to a case with existing draft
    await mainWindow.click('nav >> text=Cases');
    await mainWindow.click('.case-card >> nth=0');
    
    // Click on draft to open editor
    await mainWindow.click('.draft-list-item >> nth=0');
    
    // Wait for editor to load
    await expect(mainWindow.locator('.tiptap-editor')).toBeVisible();
    
    // Step 1: Add text
    await mainWindow.click('.tiptap-editor');
    await mainWindow.type('.tiptap-editor', 'The plaintiff failed to establish standing. ');
    
    // Step 2: Insert citation
    await mainWindow.click('button[title="Insert Citation"]');
    
    // Citation modal opens
    await expect(mainWindow.locator('.citation-modal')).toBeVisible();
    
    // Select evidence type
    await mainWindow.click('button:has-text("Exhibit")');
    
    // Create unlinked citation first
    await mainWindow.fill('input[name="display-text"]', 'Ex. A');
    await mainWindow.click('button:has-text("Insert")');
    
    // Citation should appear as amber (unlinked)
    await expect(mainWindow.locator('.citation-chip.citation-unlinked')).toBeVisible();
    await expect(mainWindow.locator('.citation-chip:has-text("Ex. A")')).toHaveCSS('background-color', /rgb\(255, 251, 235\)/); // Amber background
    
    // Step 3: Link citation to evidence
    await mainWindow.dblclick('.citation-chip:has-text("Ex. A")');
    
    // Citation popover opens
    await expect(mainWindow.locator('.citation-popover')).toBeVisible();
    
    // Upload evidence file (simulated)
    await mainWindow.click('button:has-text("Upload Evidence")');
    // File picker would open (mocked in test environment)
    
    // Select evidence from list instead
    await mainWindow.click('button:has-text("Select Existing")');
    await mainWindow.click('.evidence-list-item >> nth=0');
    await mainWindow.click('button:has-text("Link")');
    
    // Citation color should change to blue (linked)
    await expect(mainWindow.locator('.citation-chip.citation-linked')).toBeVisible();
    await expect(mainWindow.locator('.citation-chip:has-text("Ex. A")')).toHaveCSS('background-color', /rgb\(239, 246, 255\)/); // Blue background
    
    // Step 4: Save draft
    await mainWindow.click('button:has-text("Save")');
    
    // Success toast
    await expect(mainWindow.locator('.toast-success')).toContainText('Draft saved');
    
    // Step 5: Navigate away and back to verify persistence
    await mainWindow.click('nav >> text=Cases');
    await mainWindow.click('.case-card >> nth=0');
    await mainWindow.click('.draft-list-item >> nth=0');
    
    // Citation should still be blue (linked)
    await expect(mainWindow.locator('.citation-chip.citation-linked:has-text("Ex. A")')).toBeVisible();
  });
  
  test('should support section cross-references', async ({ mainWindow }) => {
    // Open draft
    await mainWindow.click('nav >> text=Cases');
    await mainWindow.click('.case-card >> nth=0');
    await mainWindow.click('.draft-list-item >> nth=0');
    
    // Insert cross-reference
    await mainWindow.click('.tiptap-editor');
    await mainWindow.type('.tiptap-editor', 'As discussed in ');
    await mainWindow.click('button[title="Insert Cross-Reference"]');
    
    // Select target section
    await mainWindow.click('.section-picker >> text=Introduction');
    await mainWindow.click('button:has-text("Insert")');
    
    // Cross-reference should appear as purple chip
    await expect(mainWindow.locator('.cross-ref-chip')).toBeVisible();
    await expect(mainWindow.locator('.cross-ref-chip')).toContainText('Section');
  });
});
```

---

### 3.4 Export Workflow Test

**File:** `e2e-tests/tests/04-export-workflow.spec.ts`

**Action:** CREATE

**Purpose:** Test DOCX export functionality

**Content:**
```typescript
import { test, expect } from '../utils/electron';
import fs from 'fs';
import path from 'path';

/**
 * E2E Test: Export Workflow
 * 
 * Reference: Runbook 0 Section 18.2.4
 * 
 * Validates export functionality:
 * 1. Open draft
 * 2. Click Export
 * 3. Preview generated DOCX
 * 4. Save to file system
 * 5. Verify file exists
 * 6. Verify file is valid DOCX
 */
test.describe('Export Workflow', () => {
  test('should export draft to DOCX', async ({ mainWindow }) => {
    // Navigate to draft
    await mainWindow.click('nav >> text=Cases');
    await mainWindow.click('.case-card >> nth=0');
    await mainWindow.click('.draft-list-item >> nth=0');
    
    // Wait for editor
    await expect(mainWindow.locator('.tiptap-editor')).toBeVisible();
    
    // Step 1: Click Export button
    await mainWindow.click('button:has-text("Export")');
    
    // Export modal should open
    await expect(mainWindow.locator('.export-modal')).toBeVisible();
    
    // Step 2: Preview should be generated
    await expect(mainWindow.locator('.export-preview')).toBeVisible();
    
    // Step 3: Click Download
    const downloadPromise = mainWindow.waitForEvent('download');
    await mainWindow.click('button:has-text("Download DOCX")');
    const download = await downloadPromise;
    
    // Save to temp location
    const tempPath = path.join(__dirname, '../test-results', `export-${Date.now()}.docx`);
    await download.saveAs(tempPath);
    
    // Step 4: Verify file exists
    expect(fs.existsSync(tempPath)).toBeTruthy();
    
    // Step 5: Verify file is valid DOCX (check magic bytes)
    const buffer = fs.readFileSync(tempPath);
    const magicBytes = buffer.slice(0, 4).toString('hex');
    expect(magicBytes).toBe('504b0304'); // ZIP header (DOCX is ZIP)
    
    // Step 6: Verify file size is reasonable (> 1KB)
    const stats = fs.statSync(tempPath);
    expect(stats.size).toBeGreaterThan(1024);
    
    // Cleanup
    fs.unlinkSync(tempPath);
  });
  
  test('should include all sections in export', async ({ mainWindow }) => {
    // Open draft with multiple sections
    await mainWindow.click('nav >> text=Cases');
    await mainWindow.click('.case-card >> nth=0');
    await mainWindow.click('.draft-list-item >> nth=0');
    
    // Count sections in editor
    const sectionCount = await mainWindow.locator('.editor-section').count();
    
    // Export
    await mainWindow.click('button:has-text("Export")');
    
    // Preview should show same number of sections
    const previewSections = await mainWindow.locator('.export-preview .section').count();
    expect(previewSections).toBe(sectionCount);
  });
});
```

---

### 3.5 Visual Regression Tests

**File:** `e2e-tests/tests/visual/01-ui-screenshots.spec.ts`

**Action:** CREATE

**Purpose:** Visual regression testing with screenshots

**Content:**
```typescript
import { test, expect } from '../../utils/electron';

/**
 * Visual Regression Tests
 * 
 * Reference: Runbook 0 Section 18.4
 * 
 * Captures screenshots of key views and compares against baselines.
 * Detects unintended UI changes.
 */
test.describe('Visual Regression', () => {
  test('Cases view should match baseline', async ({ mainWindow }) => {
    await mainWindow.click('nav >> text=Cases');
    await mainWindow.waitForLoadState('networkidle');
    
    // Take screenshot and compare
    await expect(mainWindow).toHaveScreenshot('cases-view.png', {
      maxDiffPixels: 100 // Allow minor differences
    });
  });
  
  test('Template editor should match baseline', async ({ mainWindow }) => {
    await mainWindow.click('nav >> text=Templates');
    await mainWindow.click('.template-card >> nth=0');
    await mainWindow.waitForLoadState('networkidle');
    
    await expect(mainWindow).toHaveScreenshot('template-editor.png', {
      maxDiffPixels: 100
    });
  });
  
  test('Draft editor should match baseline', async ({ mainWindow }) => {
    await mainWindow.click('nav >> text=Cases');
    await mainWindow.click('.case-card >> nth=0');
    await mainWindow.click('.draft-list-item >> nth=0');
    await mainWindow.waitForLoadState('networkidle');
    
    await expect(mainWindow).toHaveScreenshot('draft-editor.png', {
      maxDiffPixels: 150 // Editor may have cursor differences
    });
  });
  
  test('Citation chips should render correctly', async ({ mainWindow }) => {
    await mainWindow.click('nav >> text=Cases');
    await mainWindow.click('.case-card >> nth=0');
    await mainWindow.click('.draft-list-item >> nth=0');
    
    // Find a citation chip
    const citation = mainWindow.locator('.citation-chip').first();
    await citation.waitFor({ state: 'visible' });
    
    // Screenshot just the citation
    await expect(citation).toHaveScreenshot('citation-chip.png');
  });
});
```

---

## Task 4: CI/CD Integration

### 4.1 GitHub Actions Workflow

**File:** `.github/workflows/e2e-tests.yml`

**Action:** CREATE

**Purpose:** Run E2E tests in CI

**Content:**
```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test-linux:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          npm ci
          pip install -r requirements.txt
      
      - name: Build application
        run: ./scripts/build-all.sh
      
      - name: Install Playwright
        run: |
          cd e2e-tests
          npm ci
          npx playwright install --with-deps
      
      - name: Run E2E tests
        run: |
          cd e2e-tests
          npm test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results-linux
          path: e2e-tests/test-results/
          retention-days: 30
      
      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: html-report-linux
          path: e2e-tests/test-results/html/
          retention-days: 30
  
  test-macos:
    runs-on: macos-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Build application
        run: ./scripts/build-all.sh
      
      - name: Install Playwright
        run: |
          cd e2e-tests
          npm ci
          npx playwright install --with-deps
      
      - name: Run E2E tests
        run: |
          cd e2e-tests
          npm test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results-macos
          path: e2e-tests/test-results/
  
  test-windows:
    runs-on: windows-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Build application
        run: |
          scripts\packaging\build-python-services.bat
          cd desktop
          npm ci
          npm run dist:win
      
      - name: Install Playwright
        run: |
          cd e2e-tests
          npm ci
          npx playwright install --with-deps
      
      - name: Run E2E tests
        run: |
          cd e2e-tests
          npm test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results-windows
          path: e2e-tests/test-results/
```

---

## Verification

**From Runbook 0 Section 19.11:**

### Verification Checklist

**Playwright Setup:**
- [ ] Playwright installed and configured
- [ ] Electron app launches in test mode
- [ ] Main window accessible from tests
- [ ] Custom fixtures working (electronApp, mainWindow)
- [ ] Test timeout configured (5 minutes)
- [ ] Trace collection on retry working

**Test Data:**
- [ ] Mock template generator works
- [ ] Mock case generator works
- [ ] Mock draft generator works
- [ ] Test data is deterministic
- [ ] Sample DOCX fixture available

**Critical Workflows:**
- [ ] Template creation test passes
- [ ] Case creation test passes
- [ ] Draft editing test passes
- [ ] Evidence linking test passes
- [ ] Export workflow test passes
- [ ] All 8 critical workflows covered

**Visual Regression:**
- [ ] Screenshots captured for key views
- [ ] Baseline images generated
- [ ] Comparison working (maxDiffPixels)
- [ ] Visual tests pass on first run
- [ ] Update snapshots command works

**CI/CD:**
- [ ] Tests run on Linux
- [ ] Tests run on macOS
- [ ] Tests run on Windows
- [ ] Test results uploaded to artifacts
- [ ] HTML report generated
- [ ] Tests fail on regression

**Test Quality:**
- [ ] All tests are deterministic
- [ ] No flaky tests
- [ ] Tests clean up after themselves
- [ ] Tests can run in parallel (when safe)
- [ ] Tests provide clear failure messages

---

## Success Criteria

✅ Playwright configured for all 3 platforms
✅ 8+ critical workflow tests passing
✅ Visual regression baselines established
✅ Test fixtures generate consistent data
✅ CI pipeline runs tests on every commit
✅ Test reports accessible via artifacts
✅ All tests pass on fresh build
✅ No false positives or flaky tests

---

## Next Steps

After Runbook 11 completes:

1. **Runbook 12:** Integration Testing
   - API contract tests
   - Service-to-service communication tests
   - Database migration tests
   - Cross-service transaction tests

2. **Runbook 13:** User Documentation
3. **Runbook 14:** CI/CD Pipelines
4. **Runbook 15:** Production Deployment

---

## Reference

**Runbook 0 Sections:**
- Section 18: Testing Strategy
- Section 19.11: E2E Test Verification

**Dependencies:**
- Runbooks 1-10: Complete desktop application

**External Tools:**
- Playwright: https://playwright.dev
- Playwright Electron: https://playwright.dev/docs/api/class-electron

---

**End of Runbook 11**
