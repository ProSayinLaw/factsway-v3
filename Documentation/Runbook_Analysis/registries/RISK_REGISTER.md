# Risk Register

R-001
- Description: **Risk Level:** 🟢 LOW (creates new package, no modifications to existing code)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md
- Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1603-L1603 "**Risk Level:** 🟢 LOW (creates new package, no modifications to existing code)"

R-002
- Description: - **Risk:** Type definitions become inconsistent with Runbook 0 schema
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_1_METADATA.md
- Source: Metadata/RUNBOOK_1_METADATA.md:L230-L230 "- **Risk:** Type definitions become inconsistent with Runbook 0 schema"

R-003
- Description: - **Risk:** Breaking changes to types after other services depend on them
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_1_METADATA.md
- Source: Metadata/RUNBOOK_1_METADATA.md:L239-L239 "- **Risk:** Breaking changes to types after other services depend on them"

R-004
- Description: - **Risk:** TypeScript compilation fails in consuming services
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_1_METADATA.md
- Source: Metadata/RUNBOOK_1_METADATA.md:L249-L249 "- **Risk:** TypeScript compilation fails in consuming services"

R-005
- Description: - **Risk:** Sentence offset invariant violated during parsing
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_1_METADATA.md
- Source: Metadata/RUNBOOK_1_METADATA.md:L260-L260 "- **Risk:** Sentence offset invariant violated during parsing"

R-006
- Description: - **Risk:** UUID generation collisions (extremely unlikely)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_1_METADATA.md
- Source: Metadata/RUNBOOK_1_METADATA.md:L269-L269 "- **Risk:** UUID generation collisions (extremely unlikely)"

R-007
- Description: - **Risk:** Package not published to npm, services can't install
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_1_METADATA.md
- Source: Metadata/RUNBOOK_1_METADATA.md:L280-L280 "- **Risk:** Package not published to npm, services can't install"

R-008
- Description: - **Risk:** Large type files slow down TypeScript compilation
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_1_METADATA.md
- Source: Metadata/RUNBOOK_1_METADATA.md:L291-L291 "- **Risk:** Large type files slow down TypeScript compilation"

R-009
- Description: - **Risk:** Type mismatches between frontend (Tiptap) and backend (LegalDocument)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_1_METADATA.md
- Source: Metadata/RUNBOOK_1_METADATA.md:L302-L302 "- **Risk:** Type mismatches between frontend (Tiptap) and backend (LegalDocument)"

R-010
- Description: - **Risk:** SQLite and PostgreSQL schema divergence
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_2_METADATA.md
- Source: Metadata/RUNBOOK_2_METADATA.md:L346-L346 "- **Risk:** SQLite and PostgreSQL schema divergence"

R-011
- Description: - **Risk:** Breaking schema changes after services are deployed
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_2_METADATA.md
- Source: Metadata/RUNBOOK_2_METADATA.md:L357-L357 "- **Risk:** Breaking schema changes after services are deployed"

R-012
- Description: - **Risk:** Migration order confusion (migrations run out of order)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_2_METADATA.md
- Source: Metadata/RUNBOOK_2_METADATA.md:L373-L373 "- **Risk:** Migration order confusion (migrations run out of order)"

R-013
- Description: - **Risk:** JSON schema mismatch (document_json doesn't match LegalDocument)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_2_METADATA.md
- Source: Metadata/RUNBOOK_2_METADATA.md:L386-L386 "- **Risk:** JSON schema mismatch (document_json doesn't match LegalDocument)"

R-014
- Description: - **Risk:** content_json desynchronization from document_json
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_2_METADATA.md
- Source: Metadata/RUNBOOK_2_METADATA.md:L397-L397 "- **Risk:** content_json desynchronization from document_json"

R-015
- Description: - **Risk:** Foreign key cascade deletes unintended data
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_2_METADATA.md
- Source: Metadata/RUNBOOK_2_METADATA.md:L408-L408 "- **Risk:** Foreign key cascade deletes unintended data"

R-016
- Description: - **Risk:** SQLite database corruption (desktop)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_2_METADATA.md
- Source: Metadata/RUNBOOK_2_METADATA.md:L423-L423 "- **Risk:** SQLite database corruption (desktop)"

R-017
- Description: - **Risk:** PostgreSQL connection pool exhaustion (cloud)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_2_METADATA.md
- Source: Metadata/RUNBOOK_2_METADATA.md:L434-L434 "- **Risk:** PostgreSQL connection pool exhaustion (cloud)"

R-018
- Description: - **Risk:** JSON column queries are slow (no indexes)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_2_METADATA.md
- Source: Metadata/RUNBOOK_2_METADATA.md:L448-L448 "- **Risk:** JSON column queries are slow (no indexes)"

R-019
- Description: - **Risk:** Large document_json blobs slow down queries
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_2_METADATA.md
- Source: Metadata/RUNBOOK_2_METADATA.md:L459-L459 "- **Risk:** Large document_json blobs slow down queries"

R-020
- Description: - **Risk:** Repository pattern breaks with future ORM (Prisma, TypeORM)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_2_METADATA.md
- Source: Metadata/RUNBOOK_2_METADATA.md:L472-L472 "- **Risk:** Repository pattern breaks with future ORM (Prisma, TypeORM)"

R-021
- Description: - **Risk:** Port 3001 conflict with other services
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_3_METADATA.md
- Source: Metadata/RUNBOOK_3_METADATA.md:L460-L460 "- **Risk:** Port 3001 conflict with other services"

R-022
- Description: - **Risk:** Database connection pool exhaustion
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_3_METADATA.md
- Source: Metadata/RUNBOOK_3_METADATA.md:L471-L471 "- **Risk:** Database connection pool exhaustion"

R-023
- Description: - **Risk:** Express server memory leak
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_3_METADATA.md
- Source: Metadata/RUNBOOK_3_METADATA.md:L482-L482 "- **Risk:** Express server memory leak"

R-024
- Description: - **Risk:** Concurrent draft updates cause data loss
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_3_METADATA.md
- Source: Metadata/RUNBOOK_3_METADATA.md:L495-L495 "- **Risk:** Concurrent draft updates cause data loss"

R-025
- Description: - **Risk:** Deleting template cascades to all cases/drafts
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_3_METADATA.md
- Source: Metadata/RUNBOOK_3_METADATA.md:L507-L507 "- **Risk:** Deleting template cascades to all cases/drafts"

R-026
- Description: - **Risk:** Breaking API changes after Renderer is implemented
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_3_METADATA.md
- Source: Metadata/RUNBOOK_3_METADATA.md:L520-L520 "- **Risk:** Breaking API changes after Renderer is implemented"

R-027
- Description: - **Risk:** Large draft document_json slows down API responses
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_3_METADATA.md
- Source: Metadata/RUNBOOK_3_METADATA.md:L537-L537 "- **Risk:** Large draft document_json slows down API responses"

R-028
- Description: - **Risk:** N+1 query problem in case/draft lists
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_3_METADATA.md
- Source: Metadata/RUNBOOK_3_METADATA.md:L549-L549 "- **Risk:** N+1 query problem in case/draft lists"

R-029
- Description: - **Risk:** Service crashes on uncaught exception
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_3_METADATA.md
- Source: Metadata/RUNBOOK_3_METADATA.md:L562-L562 "- **Risk:** Service crashes on uncaught exception"

R-030
- Description: - **Risk:** CORS errors block Renderer requests (cloud deployment)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_3_METADATA.md
- Source: Metadata/RUNBOOK_3_METADATA.md:L573-L573 "- **Risk:** CORS errors block Renderer requests (cloud deployment)"

R-031
- Description: - **Risk:** LLM API rate limits during bulk processing
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_4_5_METADATA.md
- Source: Metadata/RUNBOOK_4_5_METADATA.md:L146-L146 "- **Risk:** LLM API rate limits during bulk processing"

R-032
- Description: - **Risk:** DOCX parsing fails for complex formatting
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_4_5_METADATA.md
- Source: Metadata/RUNBOOK_4_5_METADATA.md:L151-L151 "- **Risk:** DOCX parsing fails for complex formatting"

R-033
- Description: - **Risk:** High LLM API costs for document-heavy users
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_4_5_METADATA.md
- Source: Metadata/RUNBOOK_4_5_METADATA.md:L158-L158 "- **Risk:** High LLM API costs for document-heavy users"

R-034
- Description: - **Risk:** Large documents (200+ pages) timeout
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_4_5_METADATA.md
- Source: Metadata/RUNBOOK_4_5_METADATA.md:L281-L281 "- **Risk:** Large documents (200+ pages) timeout"

R-035
- Description: - **Risk:** Complex formatting breaks DOCX structure
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_4_5_METADATA.md
- Source: Metadata/RUNBOOK_4_5_METADATA.md:L286-L286 "- **Risk:** Complex formatting breaks DOCX structure"

R-036
- Description: - **Risk:** Text loss during generation
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_4_5_METADATA.md
- Source: Metadata/RUNBOOK_4_5_METADATA.md:L293-L293 "- **Risk:** Text loss during generation"

R-037
- Description: - **Risk:** Port conflicts between 4 services
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_6_METADATA.md
- Source: Metadata/RUNBOOK_6_METADATA.md:L393-L393 "- **Risk:** Port conflicts between 4 services"

R-038
- Description: - **Risk:** Citation parser fails for complex citations
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_6_METADATA.md
- Source: Metadata/RUNBOOK_6_METADATA.md:L401-L401 "- **Risk:** Citation parser fails for complex citations"

R-039
- Description: - **Risk:** Evidence file storage fills disk
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_6_METADATA.md
- Source: Metadata/RUNBOOK_6_METADATA.md:L411-L411 "- **Risk:** Evidence file storage fills disk"

R-040
- Description: - **Risk:** Evidence files deleted but DB records remain (orphaned metadata)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_6_METADATA.md
- Source: Metadata/RUNBOOK_6_METADATA.md:L422-L422 "- **Risk:** Evidence files deleted but DB records remain (orphaned metadata)"

R-041
- Description: - **Risk:** Template variable replacement breaks document structure
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_6_METADATA.md
- Source: Metadata/RUNBOOK_6_METADATA.md:L430-L430 "- **Risk:** Template variable replacement breaks document structure"

R-042
- Description: - **Risk:** 4 services increase startup time complexity
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_6_METADATA.md
- Source: Metadata/RUNBOOK_6_METADATA.md:L440-L440 "- **Risk:** 4 services increase startup time complexity"

R-043
- Description: - **Risk:** One service crashes, others continue (partial system failure)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_6_METADATA.md
- Source: Metadata/RUNBOOK_6_METADATA.md:L448-L448 "- **Risk:** One service crashes, others continue (partial system failure)"

R-044
- Description: - **Risk:** Analysis service slow for large documents (200+ pages)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_6_METADATA.md
- Source: Metadata/RUNBOOK_6_METADATA.md:L461-L461 "- **Risk:** Analysis service slow for large documents (200+ pages)"

R-045
- Description: - **Risk:** Evidence file uploads timeout for large files
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_6_METADATA.md
- Source: Metadata/RUNBOOK_6_METADATA.md:L469-L469 "- **Risk:** Evidence file uploads timeout for large files"

R-046
- Description: - **Risk:** Renderer doesn't know which services are available
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_6_METADATA.md
- Source: Metadata/RUNBOOK_6_METADATA.md:L479-L479 "- **Risk:** Renderer doesn't know which services are available"

R-047
- Description: - **Risk:** Service startup race conditions
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_7_METADATA.md
- Source: Metadata/RUNBOOK_7_METADATA.md:L364-L364 "- **Risk:** Service startup race conditions"

R-048
- Description: - **Risk:** Electron single-instance lock fails
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_7_METADATA.md
- Source: Metadata/RUNBOOK_7_METADATA.md:L372-L372 "- **Risk:** Electron single-instance lock fails"

R-049
- Description: - **Risk:** Child process zombies (services don't stop on shutdown)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_7_METADATA.md
- Source: Metadata/RUNBOOK_7_METADATA.md:L380-L380 "- **Risk:** Child process zombies (services don't stop on shutdown)"

R-050
- Description: - **Risk:** Database initialization fails on first run
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_7_METADATA.md
- Source: Metadata/RUNBOOK_7_METADATA.md:L390-L390 "- **Risk:** Database initialization fails on first run"

R-051
- Description: - **Risk:** Database locked during operation (SQLite limitation)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_7_METADATA.md
- Source: Metadata/RUNBOOK_7_METADATA.md:L398-L398 "- **Risk:** Database locked during operation (SQLite limitation)"

R-052
- Description: - **Risk:** Service auto-restart loop (service crashes immediately on start)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_7_METADATA.md
- Source: Metadata/RUNBOOK_7_METADATA.md:L408-L408 "- **Risk:** Service auto-restart loop (service crashes immediately on start)"

R-053
- Description: - **Risk:** Health monitor overwhelms services with requests
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_7_METADATA.md
- Source: Metadata/RUNBOOK_7_METADATA.md:L416-L416 "- **Risk:** Health monitor overwhelms services with requests"

R-054
- Description: - **Risk:** Log files grow unbounded
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_7_METADATA.md
- Source: Metadata/RUNBOOK_7_METADATA.md:L424-L424 "- **Risk:** Log files grow unbounded"

R-055
- Description: - **Risk:** Long startup time (8 services take 10-20s to start)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_7_METADATA.md
- Source: Metadata/RUNBOOK_7_METADATA.md:L434-L434 "- **Risk:** Long startup time (8 services take 10-20s to start)"

R-056
- Description: - **Risk:** Services crash silently (user doesn't notice)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_7_METADATA.md
- Source: Metadata/RUNBOOK_7_METADATA.md:L442-L442 "- **Risk:** Services crash silently (user doesn't notice)"

R-057
- Description: - **Risk:** Tiptap ↔ LegalDocument transformation loses data
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_8_9_10_METADATA.md
- Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L157-L157 "- **Risk:** Tiptap ↔ LegalDocument transformation loses data"

R-058
- Description: - **Risk:** Auto-save conflicts with manual save
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_8_9_10_METADATA.md
- Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L162-L162 "- **Risk:** Auto-save conflicts with manual save"

R-059
- Description: - **Risk:** Editor lag on large documents (200+ pages)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_8_9_10_METADATA.md
- Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L169-L169 "- **Risk:** Editor lag on large documents (200+ pages)"

R-060
- Description: - **Risk:** Code signing fails (macOS notarization, Windows authenticode)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_8_9_10_METADATA.md
- Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L320-L320 "- **Risk:** Code signing fails (macOS notarization, Windows authenticode)"

R-061
- Description: - **Risk:** Missing dependencies in bundled services
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_8_9_10_METADATA.md
- Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L325-L325 "- **Risk:** Missing dependencies in bundled services"

R-062
- Description: - **Risk:** Installer size too large (>500MB)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_8_9_10_METADATA.md
- Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L332-L332 "- **Risk:** Installer size too large (>500MB)"

R-063
- Description: - **Risk:** Electron app doesn't launch in CI
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_11_METADATA.md
- Source: Metadata/RUNBOOK_11_METADATA.md:L184-L184 "- **Risk:** Electron app doesn't launch in CI"

R-064
- Description: - **Risk:** Tests are flaky (race conditions)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_11_METADATA.md
- Source: Metadata/RUNBOOK_11_METADATA.md:L192-L192 "- **Risk:** Tests are flaky (race conditions)"

R-065
- Description: - **Risk:** Visual regression false positives (anti-aliasing, font rendering)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_11_METADATA.md
- Source: Metadata/RUNBOOK_11_METADATA.md:L200-L200 "- **Risk:** Visual regression false positives (anti-aliasing, font rendering)"

R-066
- Description: - **Risk:** E2E tests take too long (>30 minutes)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_11_METADATA.md
- Source: Metadata/RUNBOOK_11_METADATA.md:L210-L210 "- **Risk:** E2E tests take too long (>30 minutes)"

R-067
- Description: - **Risk:** Screenshots consume too much storage (>1GB)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_11_METADATA.md
- Source: Metadata/RUNBOOK_11_METADATA.md:L220-L220 "- **Risk:** Screenshots consume too much storage (>1GB)"

R-068
- Description: - **Risk:** Services don't stop cleanly (port conflicts on re-run)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_12_METADATA.md
- Source: Metadata/RUNBOOK_12_METADATA.md:L134-L134 "- **Risk:** Services don't stop cleanly (port conflicts on re-run)"

R-069
- Description: - **Risk:** Documentation becomes outdated (UI changes)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_13_METADATA.md
- Source: Metadata/RUNBOOK_13_METADATA.md:L99-L99 "- **Risk:** Documentation becomes outdated (UI changes)"

R-070
- Description: - **Risk:** Code signing certificates expire
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_14_METADATA.md
- Source: Metadata/RUNBOOK_14_METADATA.md:L104-L104 "- **Risk:** Code signing certificates expire"

R-071
- Description: - **Risk:** macOS notarization fails (Apple API issues)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_14_METADATA.md
- Source: Metadata/RUNBOOK_14_METADATA.md:L112-L112 "- **Risk:** macOS notarization fails (Apple API issues)"

R-072
- Description: - **Risk:** Auto-update server down (S3 outage)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_15_METADATA.md
- Source: Metadata/RUNBOOK_15_METADATA.md:L135-L135 "- **Risk:** Auto-update server down (S3 outage)"

R-073
- Description: - **Risk:** Kubernetes cluster capacity exhausted
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_15_METADATA.md
- Source: Metadata/RUNBOOK_15_METADATA.md:L143-L143 "- **Risk:** Kubernetes cluster capacity exhausted"

R-074
- Description: - **Risk:** Alert fatigue (too many false positives)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_15_METADATA.md
- Source: Metadata/RUNBOOK_15_METADATA.md:L153-L153 "- **Risk:** Alert fatigue (too many false positives)"

R-075
- Description: - **Risk:** Specification drift (implementation diverges from Runbook 0)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_0_METADATA.md
- Source: Metadata/RUNBOOK_0_METADATA.md:L200-L200 "- **Risk:** Specification drift (implementation diverges from Runbook 0)"

R-076
- Description: - **Risk:** Incomplete sections (gaps in specification)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_0_METADATA.md
- Source: Metadata/RUNBOOK_0_METADATA.md:L211-L211 "- **Risk:** Incomplete sections (gaps in specification)"

R-077
- Description: - **Risk:** Conflicting specifications (contradictory requirements)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_0_METADATA.md
- Source: Metadata/RUNBOOK_0_METADATA.md:L222-L222 "- **Risk:** Conflicting specifications (contradictory requirements)"

R-078
- Description: - **Risk:** Scope creep (adding features not in Runbook 0)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_0_METADATA.md
- Source: Metadata/RUNBOOK_0_METADATA.md:L235-L235 "- **Risk:** Scope creep (adding features not in Runbook 0)"

R-079
- Description: - **Risk:** Under-specification (missing requirements discovered late)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_0_METADATA.md
- Source: Metadata/RUNBOOK_0_METADATA.md:L246-L246 "- **Risk:** Under-specification (missing requirements discovered late)"

R-080
- Description: - **Risk:** Specification becomes outdated (not updated with changes)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_0_METADATA.md
- Source: Metadata/RUNBOOK_0_METADATA.md:L259-L259 "- **Risk:** Specification becomes outdated (not updated with changes)"

R-081
- Description: - **Risk:** Cross-references break (sections renumbered)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_0_METADATA.md
- Source: Metadata/RUNBOOK_0_METADATA.md:L270-L270 "- **Risk:** Cross-references break (sections renumbered)"

R-082
- Description: - **Risk:** Over-engineering (specification too complex)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_0_METADATA.md
- Source: Metadata/RUNBOOK_0_METADATA.md:L283-L283 "- **Risk:** Over-engineering (specification too complex)"

R-083
- Description: - **Risk:** Under-engineering (specification too simple)
- Trigger / failure mode: UNSPECIFIED
- Impact: UNSPECIFIED
- Mitigation: UNSPECIFIED
- Verification: UNSPECIFIED
- Runbooks impacted: Metadata/RUNBOOK_0_METADATA.md
- Source: Metadata/RUNBOOK_0_METADATA.md:L294-L294 "- **Risk:** Under-engineering (specification too simple)"
