# Verification Gate Index

## 01_RUNBOOK_01_REFERENCE_DOCUMENT.md
- Command: ## Task 4: Build and Verify
  - Expected outcome: UNSPECIFIED (TODO 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1123-L1123)
- Command: npm test
  - Expected outcome: UNSPECIFIED (TODO 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1242-L1242)
- Command: npm test
  - Expected outcome: UNSPECIFIED (TODO 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1367-L1367)
- Command: npm test
  - Expected outcome: UNSPECIFIED (TODO 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1379-L1379)
- Command: npm test
  - Expected outcome: UNSPECIFIED (TODO 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1415-L1415)
- Command: // Verify structure
  - Expected outcome: UNSPECIFIED (TODO 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1486-L1486)
- Command: // Verify sentence-paragraph relationship
  - Expected outcome: UNSPECIFIED (TODO 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1491-L1491)
- Command: npm test -- tests/integration/consumer.test.ts
  - Expected outcome: UNSPECIFIED (TODO 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1501-L1501)

## Metadata/RUNBOOK_1_METADATA.md
- Command: - Purpose: Verify types compile without errors
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_1_METADATA.md:L180-L180)
- Command: - Command: `cd packages/shared-types && npm test`
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_1_METADATA.md:L183-L183)
- Command: - Purpose: Verify types can be imported and used
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_1_METADATA.md:L193-L193)
- Command: - Command: `cd packages/shared-types && npm test -- tests/integration/consumer.test.ts`
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_1_METADATA.md:L196-L196)
- Command: - Purpose: Verify types work in realistic usage scenario
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_1_METADATA.md:L205-L205)
- Command: - Purpose: Verify types are strict-mode compliant (no `any`, proper null handling)
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_1_METADATA.md:L210-L210)
- Command: - Purpose: Verify package can be installed by other projects
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_1_METADATA.md:L215-L215)
- Command: - Purpose: Verify package exports are correct
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_1_METADATA.md:L224-L224)
- Command: 2. Verify every type definition matches the canonical schema exactly
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_1_METADATA.md:L317-L317)
- Command: - Verify each type compiles before moving to next level
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_1_METADATA.md:L326-L326)
- Command: - [ ] Package published locally (verify with `npm link`)
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_1_METADATA.md:L357-L357)

## 02_RUNBOOK_02_DATABASE_SCHEMA.md
- Command: 1. **Verify migrations run:** `npm run migrate:sqlite:up`
  - Expected outcome: UNSPECIFIED (TODO 02_RUNBOOK_02_DATABASE_SCHEMA.md:L1580-L1580)
- Command: 2. **Run tests:** `npm test`
  - Expected outcome: UNSPECIFIED (TODO 02_RUNBOOK_02_DATABASE_SCHEMA.md:L1581-L1581)

## Metadata/RUNBOOK_2_METADATA.md
- Command: - Purpose: Verify SQLite schema creation
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_2_METADATA.md:L264-L264)
- Command: - Purpose: Verify PostgreSQL schema creation
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_2_METADATA.md:L268-L268)
- Command: - Purpose: Verify table structure matches specification
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_2_METADATA.md:L282-L282)
- Command: - Command: `cd database && npm test`
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_2_METADATA.md:L285-L285)
- Command: - Purpose: Verify all CRUD operations work
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_2_METADATA.md:L302-L302)
- Command: - Purpose: Verify referential integrity enforced
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_2_METADATA.md:L314-L314)
- Command: - Purpose: Verify JSON serialization/deserialization works
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_2_METADATA.md:L325-L325)
- Command: - Purpose: Verify down migrations work (clean rollback)
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_2_METADATA.md:L340-L340)
- Command: 1. Verify Runbook 1 (`@factsway/shared-types`) is complete and importable
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_2_METADATA.md:L488-L488)
- Command: - Verify column types match LegalDocument types from Runbook 1
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_2_METADATA.md:L499-L499)
- Command: - Verify return types match expected types
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_2_METADATA.md:L510-L510)
- Command: - Verify idempotency (running twice should work)
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_2_METADATA.md:L515-L515)

## 03_RUNBOOK_03_RECORDS_SERVICE.md
- Command: // Verify it's gone
  - Expected outcome: UNSPECIFIED (TODO 03_RUNBOOK_03_RECORDS_SERVICE.md:L898-L898)
- Command: 3. **Run tests:** `npm test`
  - Expected outcome: UNSPECIFIED (TODO 03_RUNBOOK_03_RECORDS_SERVICE.md:L1035-L1035)

## Metadata/RUNBOOK_3_METADATA.md
- Command: - Purpose: Verify service starts without errors
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_3_METADATA.md:L371-L371)
- Command: - Purpose: Verify health endpoint responds
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_3_METADATA.md:L383-L383)
- Command: - Purpose: Verify all Template endpoints work
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_3_METADATA.md:L408-L408)
- Command: - Purpose: Verify Case endpoints work
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_3_METADATA.md:L413-L413)
- Command: - Purpose: Verify Draft endpoints including complex operations
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_3_METADATA.md:L418-L418)
- Command: - Command: `cd services/records-service && npm test`
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_3_METADATA.md:L421-L421)
- Command: - Purpose: Verify all endpoints work correctly
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_3_METADATA.md:L439-L439)
- Command: - Purpose: Verify error handling middleware works
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_3_METADATA.md:L454-L454)
- Command: 1. Verify Runbook 1 types and Runbook 2 database are complete
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_3_METADATA.md:L589-L589)
- Command: - Verify status codes match specification (200, 201, 404, 400)
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_3_METADATA.md:L604-L604)
- Command: - Verify foreign key to template_id works (try invalid template_id)
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_3_METADATA.md:L608-L608)
- Command: - Verify cascade deletes work (delete template, check cases/drafts deleted)
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_3_METADATA.md:L616-L616)

## 04_RUNBOOK_04_INGESTION_SERVICE.md
- Command: pytest==7.4.3
  - Expected outcome: UNSPECIFIED (TODO 04_RUNBOOK_04_INGESTION_SERVICE.md:L130-L130)
- Command: pytest-asyncio==0.21.1
  - Expected outcome: UNSPECIFIED (TODO 04_RUNBOOK_04_INGESTION_SERVICE.md:L131-L131)
- Command: [tool.pytest.ini_options]
  - Expected outcome: UNSPECIFIED (TODO 04_RUNBOOK_04_INGESTION_SERVICE.md:L145-L145)
- Command: import pytest
  - Expected outcome: UNSPECIFIED (TODO 04_RUNBOOK_04_INGESTION_SERVICE.md:L1044-L1044)
- Command: @pytest.mark.asyncio
  - Expected outcome: UNSPECIFIED (TODO 04_RUNBOOK_04_INGESTION_SERVICE.md:L1051-L1051)
- Command: # Verify LegalDocument structure
  - Expected outcome: UNSPECIFIED (TODO 04_RUNBOOK_04_INGESTION_SERVICE.md:L1065-L1065)
- Command: # Verify metadata
  - Expected outcome: UNSPECIFIED (TODO 04_RUNBOOK_04_INGESTION_SERVICE.md:L1070-L1070)
- Command: # Verify body has sections
  - Expected outcome: UNSPECIFIED (TODO 04_RUNBOOK_04_INGESTION_SERVICE.md:L1074-L1074)
- Command: # Verify sections have paragraphs
  - Expected outcome: UNSPECIFIED (TODO 04_RUNBOOK_04_INGESTION_SERVICE.md:L1077-L1077)
- Command: # Verify paragraphs have sentences
  - Expected outcome: UNSPECIFIED (TODO 04_RUNBOOK_04_INGESTION_SERVICE.md:L1081-L1081)
- Command: @pytest.mark.asyncio
  - Expected outcome: UNSPECIFIED (TODO 04_RUNBOOK_04_INGESTION_SERVICE.md:L1086-L1086)
- Command: @pytest.mark.asyncio
  - Expected outcome: UNSPECIFIED (TODO 04_RUNBOOK_04_INGESTION_SERVICE.md:L1097-L1097)
- Command: 4. **Run tests:** `pytest`
  - Expected outcome: UNSPECIFIED (TODO 04_RUNBOOK_04_INGESTION_SERVICE.md:L1168-L1168)

## Metadata/RUNBOOK_4_5_METADATA.md
- Command: - Purpose: Verify file upload and parsing works
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_4_5_METADATA.md:L130-L130)
- Command: - Purpose: Verify deterministic parser handles common abbreviations
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_4_5_METADATA.md:L135-L135)
- Command: - Purpose: Verify LLM integration works
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_4_5_METADATA.md:L140-L140)
- Command: - Purpose: Verify export pipeline works
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_4_5_METADATA.md:L265-L265)
- Command: - Purpose: Verify format compliance
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_4_5_METADATA.md:L270-L270)
- Command: - Purpose: Verify style application
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_4_5_METADATA.md:L275-L275)
- Command: - Verify all section text appears in output (no text loss)
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_4_5_METADATA.md:L333-L333)

## 05_RUNBOOK_05_EXPORT_SERVICE.md
- Command: pytest==7.4.3
  - Expected outcome: UNSPECIFIED (TODO 05_RUNBOOK_05_EXPORT_SERVICE.md:L126-L126)
- Command: pytest-asyncio==0.21.1
  - Expected outcome: UNSPECIFIED (TODO 05_RUNBOOK_05_EXPORT_SERVICE.md:L127-L127)
- Command: import pytest
  - Expected outcome: UNSPECIFIED (TODO 05_RUNBOOK_05_EXPORT_SERVICE.md:L641-L641)
- Command: @pytest.fixture
  - Expected outcome: UNSPECIFIED (TODO 05_RUNBOOK_05_EXPORT_SERVICE.md:L658-L658)
- Command: @pytest.fixture
  - Expected outcome: UNSPECIFIED (TODO 05_RUNBOOK_05_EXPORT_SERVICE.md:L663-L663)
- Command: @pytest.fixture
  - Expected outcome: UNSPECIFIED (TODO 05_RUNBOOK_05_EXPORT_SERVICE.md:L668-L668)
- Command: # Verify file was created
  - Expected outcome: UNSPECIFIED (TODO 05_RUNBOOK_05_EXPORT_SERVICE.md:L757-L757)
- Command: # Verify structure is preserved
  - Expected outcome: UNSPECIFIED (TODO 05_RUNBOOK_05_EXPORT_SERVICE.md:L782-L782)
- Command: import pytest
  - Expected outcome: UNSPECIFIED (TODO 05_RUNBOOK_05_EXPORT_SERVICE.md:L843-L843)
- Command: @pytest.mark.asyncio
  - Expected outcome: UNSPECIFIED (TODO 05_RUNBOOK_05_EXPORT_SERVICE.md:L852-L852)
- Command: @pytest.mark.asyncio
  - Expected outcome: UNSPECIFIED (TODO 05_RUNBOOK_05_EXPORT_SERVICE.md:L904-L904)
- Command: 4. **Run tests:** `pytest`
  - Expected outcome: UNSPECIFIED (TODO 05_RUNBOOK_05_EXPORT_SERVICE.md:L977-L977)

## 06_RUNBOOK_06_SPECIALIZED_SERVICES.md
- MISSING VERIFICATION GATE (RED)

## Metadata/RUNBOOK_6_METADATA.md
- Command: - Purpose: Verify case citation parsing
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_6_METADATA.md:L351-L351)
- Command: - Purpose: Verify citation validation
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_6_METADATA.md:L355-L355)
- Command: - Purpose: Verify file upload
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_6_METADATA.md:L360-L360)
- Command: - Purpose: Verify file retrieval
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_6_METADATA.md:L364-L364)
- Command: - Purpose: Verify file storage
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_6_METADATA.md:L368-L368)
- Command: - Purpose: Verify variable substitution
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_6_METADATA.md:L373-L373)
- Command: - Purpose: Verify variable extraction
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_6_METADATA.md:L377-L377)
- Command: - Purpose: Verify document analysis
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_6_METADATA.md:L382-L382)
- Command: - Purpose: Verify all services operational
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_6_METADATA.md:L387-L387)

## 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md
- Command: 3. **Verify services:** Check all 8 services are running
  - Expected outcome: UNSPECIFIED (TODO 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L916-L916)

## Metadata/RUNBOOK_7_METADATA.md
- Command: - Purpose: Verify orchestrator starts all services
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_7_METADATA.md:L324-L324)
- Command: - Purpose: Verify health monitoring works
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_7_METADATA.md:L329-L329)
- Command: - Purpose: Verify auto-restart logic
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_7_METADATA.md:L334-L334)
- Command: - Purpose: Verify IPC communication
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_7_METADATA.md:L343-L343)
- Command: - Purpose: Verify clean shutdown
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_7_METADATA.md:L358-L358)
- Command: - Verify Electron app launches
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_7_METADATA.md:L465-L465)
- Command: - [ ] Auto-restart works (kill a service, verify restart)
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_7_METADATA.md:L526-L526)

## 08_RUNBOOK_08_ELECTRON_RENDERER.md
- MISSING VERIFICATION GATE (RED)

## Metadata/RUNBOOK_8_9_10_METADATA.md
- Command: - Test: Type text in editor, verify Tiptap state updates
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_8_9_10_METADATA.md:L138-L138)
- Command: - Purpose: Verify URL resolution works
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_8_9_10_METADATA.md:L240-L240)
- Command: 1. Verify Runbook 7 (Orchestrator) works - all 8 services start successfully
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_8_9_10_METADATA.md:L342-L342)
- Command: - Verify all dependencies bundled
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_8_9_10_METADATA.md:L404-L404)

## 09_RUNBOOK_09_SERVICE_DISCOVERY.md
- MISSING VERIFICATION GATE (RED)

## 10_RUNBOOK_10_DESKTOP_PACKAGING.md
- Command: 'pytest',
  - Expected outcome: UNSPECIFIED (TODO 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L135-L135)

## 11_RUNBOOK_11_E2E_TESTING.md
- Command: // Step 7: Verify case appears in list
  - Expected outcome: UNSPECIFIED (TODO 11_RUNBOOK_11_E2E_TESTING.md:L617-L617)
- Command: * 5. Verify citation color changes (amber → blue)
  - Expected outcome: UNSPECIFIED (TODO 11_RUNBOOK_11_E2E_TESTING.md:L667-L667)
- Command: * 7. Reload and verify persistence
  - Expected outcome: UNSPECIFIED (TODO 11_RUNBOOK_11_E2E_TESTING.md:L669-L669)
- Command: // Step 5: Navigate away and back to verify persistence
  - Expected outcome: UNSPECIFIED (TODO 11_RUNBOOK_11_E2E_TESTING.md:L729-L729)
- Command: * 5. Verify file exists
  - Expected outcome: UNSPECIFIED (TODO 11_RUNBOOK_11_E2E_TESTING.md:L786-L786)
- Command: * 6. Verify file is valid DOCX
  - Expected outcome: UNSPECIFIED (TODO 11_RUNBOOK_11_E2E_TESTING.md:L787-L787)
- Command: // Step 4: Verify file exists
  - Expected outcome: UNSPECIFIED (TODO 11_RUNBOOK_11_E2E_TESTING.md:L817-L817)
- Command: // Step 5: Verify file is valid DOCX (check magic bytes)
  - Expected outcome: UNSPECIFIED (TODO 11_RUNBOOK_11_E2E_TESTING.md:L820-L820)
- Command: // Step 6: Verify file size is reasonable (> 1KB)
  - Expected outcome: UNSPECIFIED (TODO 11_RUNBOOK_11_E2E_TESTING.md:L825-L825)
- Command: npm test
  - Expected outcome: UNSPECIFIED (TODO 11_RUNBOOK_11_E2E_TESTING.md:L977-L977)
- Command: npm test
  - Expected outcome: UNSPECIFIED (TODO 11_RUNBOOK_11_E2E_TESTING.md:L1023-L1023)
- Command: npm test
  - Expected outcome: UNSPECIFIED (TODO 11_RUNBOOK_11_E2E_TESTING.md:L1064-L1064)

## Metadata/RUNBOOK_11_METADATA.md
- Command: - Purpose: Verify test framework setup
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_11_METADATA.md:L147-L147)
- Command: - Command: `npm test -- tests/01-template-creation.spec.ts`
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_11_METADATA.md:L150-L150)
- Command: - Purpose: Verify single test suite works
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_11_METADATA.md:L163-L163)
- Command: - Command: `npm test`
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_11_METADATA.md:L166-L166)
- Command: - Purpose: Verify complete test suite
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_11_METADATA.md:L168-L168)
- Command: - Command: `npm test -- tests/visual/`
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_11_METADATA.md:L171-L171)
- Command: - Purpose: Verify UI hasn't regressed
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_11_METADATA.md:L173-L173)
- Command: - Purpose: Verify tests work in CI environment
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_11_METADATA.md:L178-L178)
- Command: - Verify app launches and window loads
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_11_METADATA.md:L243-L243)
- Command: - Test: Open app → Click "New Template" → Fill form → Save → Verify in list
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_11_METADATA.md:L246-L246)

## 12_RUNBOOK_12_INTEGRATION_TESTING.md
- Command: // Verify deletion
  - Expected outcome: UNSPECIFIED (TODO 12_RUNBOOK_12_INTEGRATION_TESTING.md:L442-L442)
- Command: // Verify sections structure
  - Expected outcome: UNSPECIFIED (TODO 12_RUNBOOK_12_INTEGRATION_TESTING.md:L549-L549)
- Command: * 4. Verify draft structure
  - Expected outcome: UNSPECIFIED (TODO 12_RUNBOOK_12_INTEGRATION_TESTING.md:L619-L619)
- Command: // Step 4: Verify draft structure
  - Expected outcome: UNSPECIFIED (TODO 12_RUNBOOK_12_INTEGRATION_TESTING.md:L699-L699)
- Command: // Verify caseblock variables were resolved
  - Expected outcome: UNSPECIFIED (TODO 12_RUNBOOK_12_INTEGRATION_TESTING.md:L708-L708)
- Command: * 3. Verify DOCX structure
  - Expected outcome: UNSPECIFIED (TODO 12_RUNBOOK_12_INTEGRATION_TESTING.md:L734-L734)
- Command: // Step 4: Verify DOCX is valid (check magic bytes)
  - Expected outcome: UNSPECIFIED (TODO 12_RUNBOOK_12_INTEGRATION_TESTING.md:L792-L792)
- Command: // Verify tables exist
  - Expected outcome: UNSPECIFIED (TODO 12_RUNBOOK_12_INTEGRATION_TESTING.md:L854-L854)
- Command: // Verify tables removed
  - Expected outcome: UNSPECIFIED (TODO 12_RUNBOOK_12_INTEGRATION_TESTING.md:L888-L888)

## Metadata/RUNBOOK_12_METADATA.md
- Command: - Purpose: Verify services start for testing
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_12_METADATA.md:L113-L113)
- Command: - Command: `npm test -- contracts/`
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_12_METADATA.md:L116-L116)
- Command: - Purpose: Verify API contracts maintained
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_12_METADATA.md:L118-L118)
- Command: - Command: `npm test -- workflows/`
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_12_METADATA.md:L121-L121)
- Command: - Purpose: Verify service integration
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_12_METADATA.md:L123-L123)
- Command: - Command: `npm test -- --coverage`
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_12_METADATA.md:L126-L126)
- Command: - Purpose: Verify test completeness
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_12_METADATA.md:L128-L128)
- Command: - Verify services start and respond to health checks
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_12_METADATA.md:L157-L157)
- Command: - Verify service integration (one service calls another correctly)
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_12_METADATA.md:L168-L168)
- Command: - Verify within thresholds (GET <100ms, POST <150ms, Export <2000ms)
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_12_METADATA.md:L172-L172)
- Command: - Verify migrations are idempotent (can run multiple times)
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_12_METADATA.md:L178-L178)

## 13_RUNBOOK_13_USER_DOCUMENTATION.md
- Command: 4. Reload draft to verify
  - Expected outcome: UNSPECIFIED (TODO 13_RUNBOOK_13_USER_DOCUMENTATION.md:L783-L783)
- Command: 2. Verify file size (should be >5KB)
  - Expected outcome: UNSPECIFIED (TODO 13_RUNBOOK_13_USER_DOCUMENTATION.md:L843-L843)
- Command: 2. Verify only one instance running
  - Expected outcome: UNSPECIFIED (TODO 13_RUNBOOK_13_USER_DOCUMENTATION.md:L885-L885)

## Metadata/RUNBOOK_13_METADATA.md
- Command: - Purpose: Verify documentation complete
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_13_METADATA.md:L83-L83)
- Command: - Purpose: Verify documentation builds
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_13_METADATA.md:L88-L88)
- Command: - Purpose: Verify search works
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_13_METADATA.md:L93-L93)

## 14_RUNBOOK_14_CICD_PIPELINES.md
- Command: pip install pytest pytest-cov
  - Expected outcome: UNSPECIFIED (TODO 14_RUNBOOK_14_CICD_PIPELINES.md:L136-L136)
- Command: pytest services/*/tests/unit --cov --cov-report=xml
  - Expected outcome: UNSPECIFIED (TODO 14_RUNBOOK_14_CICD_PIPELINES.md:L141-L141)
- Command: npm test
  - Expected outcome: UNSPECIFIED (TODO 14_RUNBOOK_14_CICD_PIPELINES.md:L151-L151)
- Command: npm test
  - Expected outcome: UNSPECIFIED (TODO 14_RUNBOOK_14_CICD_PIPELINES.md:L183-L183)
- Command: npm test
  - Expected outcome: UNSPECIFIED (TODO 14_RUNBOOK_14_CICD_PIPELINES.md:L226-L226)

## Metadata/RUNBOOK_14_METADATA.md
- Command: - Purpose: Verify CI works
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_14_METADATA.md:L90-L90)
- Command: - Purpose: Verify release automation
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_14_METADATA.md:L98-L98)

## 15_RUNBOOK_15_PRODUCTION_DEPLOYMENT.md
- Command: 4. Verify database connectivity
  - Expected outcome: UNSPECIFIED (TODO 15_RUNBOOK_15_PRODUCTION_DEPLOYMENT.md:L862-L862)
- Command: # Verify rollback
  - Expected outcome: UNSPECIFIED (TODO 15_RUNBOOK_15_PRODUCTION_DEPLOYMENT.md:L876-L876)
- Command: 1. **Verify Fix:**
  - Expected outcome: UNSPECIFIED (TODO 15_RUNBOOK_15_PRODUCTION_DEPLOYMENT.md:L968-L968)
- Command: # Verify rollback
  - Expected outcome: UNSPECIFIED (TODO 15_RUNBOOK_15_PRODUCTION_DEPLOYMENT.md:L1045-L1045)

## Metadata/RUNBOOK_15_METADATA.md
- Command: - Purpose: Verify update server operational
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_15_METADATA.md:L114-L114)
- Command: - Purpose: Verify services deployed
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_15_METADATA.md:L119-L119)
- Command: - Purpose: Verify monitoring working
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_15_METADATA.md:L124-L124)
- Command: - Purpose: Verify alerts working
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_15_METADATA.md:L129-L129)
- Command: - Test error reporting (trigger error, verify appears in Sentry)
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_15_METADATA.md:L196-L196)
- Command: - [ ] Test alert fires successfully (stop service, verify PagerDuty/Slack)
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_15_METADATA.md:L233-L233)
- Command: - [ ] Test recovery (rollback deployment, verify services recover)
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_15_METADATA.md:L243-L243)

## 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md
- Command: pytest tests/unit/
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L368-L368)
- Command: Ask LLM to verify a single sentence boundary.
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L1715-L1715)
- Command: Verify each low-confidence boundary with a surgical LLM call.
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L1779-L1779)
- Command: # 5. Verify match
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L6425-L6425)
- Command: # Verify
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L9065-L9065)
- Command: # Verify target doc has footnotes part
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L9070-L9070)
- Command: # Verify footnote count
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L9073-L9073)
- Command: npm test  # Jest + Supertest
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L10877-L10877)
- Command: - [ ] `python -m pytest tests/schema/test_legal_document.py` passes (Pydantic validation)
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L11314-L11314)
- Command: - [ ] `python -m pytest tests/ooxml/` passes (OOXML generators)
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L11323-L11323)
- Command: - [ ] `python -m pytest tests/pandoc/` passes (Pandoc wrapper)
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L11324-L11324)
- Command: **For EACH microservice, verify:**
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L11329-L11329)
- Command: - [ ] `pytest tests/unit/` passes (95%+ coverage)
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L11342-L11342)
- Command: - [ ] `pytest tests/integration/` passes
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L11346-L11346)
- Command: - Verify ID preservation algorithm with unit tests
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L11423-L11423)
- Command: - Integration tests verify frontend → backend transformation
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L11432-L11432)
- Command: 5. [ ] Verify Ingestion Service extracted case data correctly
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L11510-L11510)
- Command: 11. [ ] Save draft (verify auto-save indicator)
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L11516-L11516)
- Command: 14. [ ] Verify formatting: fonts, spacing, margins, section numbers
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L11519-L11519)
- Command: 15. [ ] Verify case caption: centered, caps, bold
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L11520-L11520)
- Command: 16. [ ] Verify signature block: left-aligned, proper spacing
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L11521-L11521)
- Command: 17. [ ] Verify footer: motion title + page numbers
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L11522-L11522)
- Command: 18. [ ] Verify exhibit appendix: exhibit A attached
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L11523-L11523)
- Command: 19. [ ] Close and re-open draft (verify load from Records Service)
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L11524-L11524)
- Command: 20. [ ] Verify sentence IDs preserved (evidence links still work)
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L11525-L11525)
- Command: After all edits, verify cross-references are correct:
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L11529-L11529)
- Command: - Pipeline tests should verify correct events are emitted
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L14404-L14404)
- Command: jwt.verify(token, getKey, {
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L14680-L14680)
- Command: These sample documents provide exact content for testing the entire pipeline. Use them to verify parsing, editing, and export functionality.
  - Expected outcome: UNSPECIFIED (TODO 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L15258-L15258)

## Metadata/RUNBOOK_0_METADATA.md
- Command: - Purpose: Verify specification is implementation-ready
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_0_METADATA.md:L139-L139)
- Command: - Purpose: Verify navigation works
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_0_METADATA.md:L161-L161)
- Command: - Process: Read Section 4, verify all fields defined
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_0_METADATA.md:L166-L166)
- Command: - Process: Read Sections 11-14, verify API contracts
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_0_METADATA.md:L179-L179)
- Command: - Process: Read Section 19, verify all 15 subsections exist
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_0_METADATA.md:L190-L190)
- Command: - Verify runbook specification matches Runbook 0 contract
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_0_METADATA.md:L318-L318)
- Command: - Verify implementation matches Runbook 0 specification
  - Expected outcome: UNSPECIFIED (TODO Metadata/RUNBOOK_0_METADATA.md:L327-L327)
