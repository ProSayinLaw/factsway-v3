# Invariant Catalog

INV-001
- Statement: * INVARIANT: text === paragraph.text.slice(start_offset, end_offset)
- Applies To: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L375-L375 "* INVARIANT: text === paragraph.text.slice(start_offset, end_offset)"

INV-002
- Statement: - INVARIANT: All entity IDs are UUIDs (string format)
- Applies To: Metadata/RUNBOOK_1_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_1_METADATA.md:L103-L103 "- INVARIANT: All entity IDs are UUIDs (string format)"

INV-003
- Statement: - INVARIANT: All timestamps are ISO 8601 format strings
- Applies To: Metadata/RUNBOOK_1_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_1_METADATA.md:L109-L109 "- INVARIANT: All timestamps are ISO 8601 format strings"

INV-004
- Statement: - INVARIANT: Sentence text matches paragraph substring
- Applies To: Metadata/RUNBOOK_1_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_1_METADATA.md:L115-L115 "- INVARIANT: Sentence text matches paragraph substring"

INV-005
- Statement: - INVARIANT: Section hierarchy forms a tree (no cycles)
- Applies To: Metadata/RUNBOOK_1_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_1_METADATA.md:L124-L124 "- INVARIANT: Section hierarchy forms a tree (no cycles)"

INV-006
- Statement: - INVARIANT: Section numbering is consistent with hierarchy
- Applies To: Metadata/RUNBOOK_1_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_1_METADATA.md:L130-L130 "- INVARIANT: Section numbering is consistent with hierarchy"

INV-007
- Statement: - INVARIANT: Paragraph content is never empty
- Applies To: Metadata/RUNBOOK_1_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_1_METADATA.md:L136-L136 "- INVARIANT: Paragraph content is never empty"

INV-008
- Statement: - INVARIANT: Citation spans reference valid sentence IDs
- Applies To: Metadata/RUNBOOK_1_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_1_METADATA.md:L144-L144 "- INVARIANT: Citation spans reference valid sentence IDs"

INV-009
- Statement: - INVARIANT: Citation character offsets are within sentence bounds
- Applies To: Metadata/RUNBOOK_1_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_1_METADATA.md:L150-L150 "- INVARIANT: Citation character offsets are within sentence bounds"

INV-010
- Statement: - INVARIANT: CaseBlock contains required fields for jurisdiction
- Applies To: Metadata/RUNBOOK_1_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_1_METADATA.md:L158-L158 "- INVARIANT: CaseBlock contains required fields for jurisdiction"

INV-011
- Statement: - INVARIANT: SignatureBlock signers array is non-empty if block exists
- Applies To: Metadata/RUNBOOK_1_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_1_METADATA.md:L164-L164 "- INVARIANT: SignatureBlock signers array is non-empty if block exists"

INV-012
- Statement: - **Risk:** Sentence offset invariant violated during parsing
- Applies To: Metadata/RUNBOOK_1_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_1_METADATA.md:L260-L260 "- **Risk:** Sentence offset invariant violated during parsing"

INV-013
- Statement: **Step 2: Invariant Validation**
- Applies To: Metadata/RUNBOOK_1_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_1_METADATA.md:L329-L329 "**Step 2: Invariant Validation**"

INV-014
- Statement: - Each invariant in this metadata should become a TypeScript type constraint where possible
- Applies To: Metadata/RUNBOOK_1_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_1_METADATA.md:L330-L330 "- Each invariant in this metadata should become a TypeScript type constraint where possible"

INV-015
- Statement: - INVARIANT: All tables have `id` as PRIMARY KEY (UUID)
- Applies To: Metadata/RUNBOOK_2_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_2_METADATA.md:L145-L145 "- INVARIANT: All tables have `id` as PRIMARY KEY (UUID)"

INV-016
- Statement: - INVARIANT: Foreign keys reference valid parent records
- Applies To: Metadata/RUNBOOK_2_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_2_METADATA.md:L151-L151 "- INVARIANT: Foreign keys reference valid parent records"

INV-017
- Statement: - INVARIANT: `document_json` column contains valid JSON
- Applies To: Metadata/RUNBOOK_2_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_2_METADATA.md:L161-L161 "- INVARIANT: `document_json` column contains valid JSON"

INV-018
- Statement: - INVARIANT: `document_json` conforms to LegalDocument schema
- Applies To: Metadata/RUNBOOK_2_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_2_METADATA.md:L168-L168 "- INVARIANT: `document_json` conforms to LegalDocument schema"

INV-019
- Statement: - INVARIANT: `content_json` is nullable (optional auxiliary storage)
- Applies To: Metadata/RUNBOOK_2_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_2_METADATA.md:L175-L175 "- INVARIANT: `content_json` is nullable (optional auxiliary storage)"

INV-020
- Statement: - INVARIANT: Timestamps are NOT NULL and have defaults
- Applies To: Metadata/RUNBOOK_2_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_2_METADATA.md:L182-L182 "- INVARIANT: Timestamps are NOT NULL and have defaults"

INV-021
- Statement: - INVARIANT: Dual storage pattern maintains consistency
- Applies To: Metadata/RUNBOOK_2_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_2_METADATA.md:L189-L189 "- INVARIANT: Dual storage pattern maintains consistency"

INV-022
- Statement: - INVARIANT: Case variable_values match template variables
- Applies To: Metadata/RUNBOOK_2_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_2_METADATA.md:L199-L199 "- INVARIANT: Case variable_values match template variables"

INV-023
- Statement: - INVARIANT: Draft version increments monotonically
- Applies To: Metadata/RUNBOOK_2_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_2_METADATA.md:L207-L207 "- INVARIANT: Draft version increments monotonically"

INV-024
- Statement: - INVARIANT: Migrations are idempotent
- Applies To: Metadata/RUNBOOK_2_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_2_METADATA.md:L217-L217 "- INVARIANT: Migrations are idempotent"

INV-025
- Statement: - INVARIANT: Down migrations reverse up migrations
- Applies To: Metadata/RUNBOOK_2_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_2_METADATA.md:L224-L224 "- INVARIANT: Down migrations reverse up migrations"

INV-026
- Statement: - INVARIANT: Repository methods return typed objects
- Applies To: Metadata/RUNBOOK_2_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_2_METADATA.md:L234-L234 "- INVARIANT: Repository methods return typed objects"

INV-027
- Statement: - INVARIANT: Repository handles both SQLite and PostgreSQL
- Applies To: Metadata/RUNBOOK_2_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_2_METADATA.md:L241-L241 "- INVARIANT: Repository handles both SQLite and PostgreSQL"

INV-028
- Statement: - INVARIANT: Service runs on exactly one port
- Applies To: Metadata/RUNBOOK_3_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_3_METADATA.md:L275-L275 "- INVARIANT: Service runs on exactly one port"

INV-029
- Statement: - INVARIANT: Service has exactly one database connection pool
- Applies To: Metadata/RUNBOOK_3_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_3_METADATA.md:L282-L282 "- INVARIANT: Service has exactly one database connection pool"

INV-030
- Statement: - INVARIANT: All responses include proper Content-Type header
- Applies To: Metadata/RUNBOOK_3_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_3_METADATA.md:L292-L292 "- INVARIANT: All responses include proper Content-Type header"

INV-031
- Statement: - INVARIANT: All POST/PUT endpoints validate request body
- Applies To: Metadata/RUNBOOK_3_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_3_METADATA.md:L299-L299 "- INVARIANT: All POST/PUT endpoints validate request body"

INV-032
- Statement: - INVARIANT: All endpoints return consistent error format
- Applies To: Metadata/RUNBOOK_3_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_3_METADATA.md:L306-L306 "- INVARIANT: All endpoints return consistent error format"

INV-033
- Statement: - INVARIANT: Template IDs referenced in Cases must exist
- Applies To: Metadata/RUNBOOK_3_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_3_METADATA.md:L315-L315 "- INVARIANT: Template IDs referenced in Cases must exist"

INV-034
- Statement: - INVARIANT: Case IDs referenced in Drafts must exist
- Applies To: Metadata/RUNBOOK_3_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_3_METADATA.md:L322-L322 "- INVARIANT: Case IDs referenced in Drafts must exist"

INV-035
- Statement: - INVARIANT: Draft versions increment monotonically
- Applies To: Metadata/RUNBOOK_3_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_3_METADATA.md:L329-L329 "- INVARIANT: Draft versions increment monotonically"

INV-036
- Statement: - INVARIANT: GET endpoints return arrays or single objects
- Applies To: Metadata/RUNBOOK_3_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_3_METADATA.md:L339-L339 "- INVARIANT: GET endpoints return arrays or single objects"

INV-037
- Statement: - INVARIANT: POST endpoints return created object with 201 status
- Applies To: Metadata/RUNBOOK_3_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_3_METADATA.md:L346-L346 "- INVARIANT: POST endpoints return created object with 201 status"

INV-038
- Statement: - INVARIANT: DELETE endpoints return 204 No Content (no body)
- Applies To: Metadata/RUNBOOK_3_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_3_METADATA.md:L353-L353 "- INVARIANT: DELETE endpoints return 204 No Content (no body)"

INV-039
- Statement: - Hard Failures: Invariant violations (text corruption, missing coverage)
- Applies To: Metadata/RUNBOOK_4_5_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_4_5_METADATA.md:L91-L91 "- Hard Failures: Invariant violations (text corruption, missing coverage)"

INV-040
- Statement: - INVARIANT: Sentence text is exact substring of paragraph
- Applies To: Metadata/RUNBOOK_4_5_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_4_5_METADATA.md:L97-L97 "- INVARIANT: Sentence text is exact substring of paragraph"

INV-041
- Statement: - INVARIANT: All paragraph characters assigned to sentences
- Applies To: Metadata/RUNBOOK_4_5_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_4_5_METADATA.md:L104-L104 "- INVARIANT: All paragraph characters assigned to sentences"

INV-042
- Statement: - INVARIANT: All section text appears in output DOCX
- Applies To: Metadata/RUNBOOK_4_5_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_4_5_METADATA.md:L229-L229 "- INVARIANT: All section text appears in output DOCX"

INV-043
- Statement: - INVARIANT: Section numbering matches LegalDocument structure
- Applies To: Metadata/RUNBOOK_4_5_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_4_5_METADATA.md:L237-L237 "- INVARIANT: Section numbering matches LegalDocument structure"

INV-044
- Statement: - INVARIANT: Generated DOCX is valid format
- Applies To: Metadata/RUNBOOK_4_5_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_4_5_METADATA.md:L245-L245 "- INVARIANT: Generated DOCX is valid format"

INV-045
- Statement: - Validate LLM output (ensure substring invariant)
- Applies To: Metadata/RUNBOOK_4_5_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_4_5_METADATA.md:L322-L322 "- Validate LLM output (ensure substring invariant)"

INV-046
- Statement: 1. **Don't skip substring validation:** This is the sentinel invariant - enforce it
- Applies To: Metadata/RUNBOOK_4_5_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_4_5_METADATA.md:L357-L357 "1. **Don't skip substring validation:** This is the sentinel invariant - enforce it"

INV-047
- Statement: - [ ] Substring invariant enforced (hard failure if violated)
- Applies To: Metadata/RUNBOOK_4_5_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_4_5_METADATA.md:L367-L367 "- [ ] Substring invariant enforced (hard failure if violated)"

INV-048
- Statement: - INVARIANT: Parsed citations match original text
- Applies To: Metadata/RUNBOOK_6_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_6_METADATA.md:L270-L270 "- INVARIANT: Parsed citations match original text"

INV-049
- Statement: - INVARIANT: Citation types are valid enum values
- Applies To: Metadata/RUNBOOK_6_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_6_METADATA.md:L278-L278 "- INVARIANT: Citation types are valid enum values"

INV-050
- Statement: - INVARIANT: Uploaded files are stored before database record created
- Applies To: Metadata/RUNBOOK_6_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_6_METADATA.md:L287-L287 "- INVARIANT: Uploaded files are stored before database record created"

INV-051
- Statement: - INVARIANT: File paths are unique per evidence item
- Applies To: Metadata/RUNBOOK_6_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_6_METADATA.md:L295-L295 "- INVARIANT: File paths are unique per evidence item"

INV-052
- Statement: - INVARIANT: Deleted evidence removes both file and database record
- Applies To: Metadata/RUNBOOK_6_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_6_METADATA.md:L302-L302 "- INVARIANT: Deleted evidence removes both file and database record"

INV-053
- Statement: - INVARIANT: Variable replacement preserves LegalDocument structure
- Applies To: Metadata/RUNBOOK_6_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_6_METADATA.md:L312-L312 "- INVARIANT: Variable replacement preserves LegalDocument structure"

INV-054
- Statement: - INVARIANT: All template variables are replaced or error returned
- Applies To: Metadata/RUNBOOK_6_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_6_METADATA.md:L320-L320 "- INVARIANT: All template variables are replaced or error returned"

INV-055
- Statement: - INVARIANT: Word/sentence/paragraph counts match document structure
- Applies To: Metadata/RUNBOOK_6_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_6_METADATA.md:L330-L330 "- INVARIANT: Word/sentence/paragraph counts match document structure"

INV-056
- Statement: - INVARIANT: Readability scores are within valid ranges
- Applies To: Metadata/RUNBOOK_6_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_6_METADATA.md:L338-L338 "- INVARIANT: Readability scores are within valid ranges"

INV-057
- Statement: 3. File storage (Evidence Service) requires careful invariant enforcement
- Applies To: Metadata/RUNBOOK_6_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_6_METADATA.md:L494-L494 "3. File storage (Evidence Service) requires careful invariant enforcement"

INV-058
- Statement: - INVARIANT: All services started before renderer window shown
- Applies To: Metadata/RUNBOOK_7_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_7_METADATA.md:L229-L229 "- INVARIANT: All services started before renderer window shown"

INV-059
- Statement: - INVARIANT: Each service has exactly one child process
- Applies To: Metadata/RUNBOOK_7_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_7_METADATA.md:L237-L237 "- INVARIANT: Each service has exactly one child process"

INV-060
- Statement: - INVARIANT: Service ports are unique and fixed
- Applies To: Metadata/RUNBOOK_7_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_7_METADATA.md:L245-L245 "- INVARIANT: Service ports are unique and fixed"

INV-061
- Statement: - INVARIANT: Health checks never block UI
- Applies To: Metadata/RUNBOOK_7_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_7_METADATA.md:L255-L255 "- INVARIANT: Health checks never block UI"

INV-062
- Statement: - INVARIANT: Unhealthy services trigger auto-restart
- Applies To: Metadata/RUNBOOK_7_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_7_METADATA.md:L263-L263 "- INVARIANT: Unhealthy services trigger auto-restart"

INV-063
- Statement: - INVARIANT: Database initialized before any service starts
- Applies To: Metadata/RUNBOOK_7_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_7_METADATA.md:L273-L273 "- INVARIANT: Database initialized before any service starts"

INV-064
- Statement: - INVARIANT: Only one orchestrator instance runs at a time
- Applies To: Metadata/RUNBOOK_7_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_7_METADATA.md:L281-L281 "- INVARIANT: Only one orchestrator instance runs at a time"

INV-065
- Statement: - INVARIANT: All services stop before orchestrator exits
- Applies To: Metadata/RUNBOOK_7_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_7_METADATA.md:L291-L291 "- INVARIANT: All services stop before orchestrator exits"

INV-066
- Statement: - INVARIANT: Database connections closed before exit
- Applies To: Metadata/RUNBOOK_7_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_7_METADATA.md:L299-L299 "- INVARIANT: Database connections closed before exit"

INV-067
- Statement: - INVARIANT: Tiptap state syncs with LegalDocument state
- Applies To: Metadata/RUNBOOK_8_9_10_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L109-L109 "- INVARIANT: Tiptap state syncs with LegalDocument state"

INV-068
- Statement: - INVARIANT: Auto-save only when document dirty
- Applies To: Metadata/RUNBOOK_8_9_10_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L117-L117 "- INVARIANT: Auto-save only when document dirty"

INV-069
- Statement: - INVARIANT: Evidence linking preserves sentence IDs
- Applies To: Metadata/RUNBOOK_8_9_10_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L127-L127 "- INVARIANT: Evidence linking preserves sentence IDs"

INV-070
- Statement: - INVARIANT: Every service has URL defined for every environment
- Applies To: Metadata/RUNBOOK_8_9_10_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L224-L224 "- INVARIANT: Every service has URL defined for every environment"

INV-071
- Statement: - INVARIANT: All 8 services bundled in installer
- Applies To: Metadata/RUNBOOK_8_9_10_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L286-L286 "- INVARIANT: All 8 services bundled in installer"

INV-072
- Statement: - INVARIANT: Database migrations bundled
- Applies To: Metadata/RUNBOOK_8_9_10_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L294-L294 "- INVARIANT: Database migrations bundled"

INV-073
- Statement: - INVARIANT: Tests must be deterministic (no flakiness)
- Applies To: Metadata/RUNBOOK_11_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_11_METADATA.md:L100-L100 "- INVARIANT: Tests must be deterministic (no flakiness)"

INV-074
- Statement: - INVARIANT: Tests clean up after themselves
- Applies To: Metadata/RUNBOOK_11_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_11_METADATA.md:L108-L108 "- INVARIANT: Tests clean up after themselves"

INV-075
- Statement: - INVARIANT: Visual regression baselines are version-controlled
- Applies To: Metadata/RUNBOOK_11_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_11_METADATA.md:L116-L116 "- INVARIANT: Visual regression baselines are version-controlled"

INV-076
- Statement: - INVARIANT: Template creation test creates usable template
- Applies To: Metadata/RUNBOOK_11_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_11_METADATA.md:L126-L126 "- INVARIANT: Template creation test creates usable template"

INV-077
- Statement: - INVARIANT: Draft export test produces valid DOCX
- Applies To: Metadata/RUNBOOK_11_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_11_METADATA.md:L134-L134 "- INVARIANT: Draft export test produces valid DOCX"

INV-078
- Statement: - INVARIANT: All API endpoints return documented status codes
- Applies To: Metadata/RUNBOOK_12_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_12_METADATA.md:L76-L76 "- INVARIANT: All API endpoints return documented status codes"

INV-079
- Statement: - INVARIANT: All API responses match TypeScript types
- Applies To: Metadata/RUNBOOK_12_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_12_METADATA.md:L84-L84 "- INVARIANT: All API responses match TypeScript types"

INV-080
- Statement: - INVARIANT: API response times within acceptable thresholds
- Applies To: Metadata/RUNBOOK_12_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_12_METADATA.md:L94-L94 "- INVARIANT: API response times within acceptable thresholds"

INV-081
- Statement: - INVARIANT: All features have documentation
- Applies To: Metadata/RUNBOOK_13_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_13_METADATA.md:L62-L62 "- INVARIANT: All features have documentation"

INV-082
- Statement: - INVARIANT: Screenshots match current UI
- Applies To: Metadata/RUNBOOK_13_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_13_METADATA.md:L70-L70 "- INVARIANT: Screenshots match current UI"

INV-083
- Statement: - INVARIANT: All tests must pass before merge
- Applies To: Metadata/RUNBOOK_14_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_14_METADATA.md:L69-L69 "- INVARIANT: All tests must pass before merge"

INV-084
- Statement: - INVARIANT: Releases only created from tagged commits
- Applies To: Metadata/RUNBOOK_14_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_14_METADATA.md:L77-L77 "- INVARIANT: Releases only created from tagged commits"

INV-085
- Statement: - INVARIANT: All services deployed with same version
- Applies To: Metadata/RUNBOOK_15_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_15_METADATA.md:L83-L83 "- INVARIANT: All services deployed with same version"

INV-086
- Statement: - INVARIANT: Database migrations run before service deployment
- Applies To: Metadata/RUNBOOK_15_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_15_METADATA.md:L91-L91 "- INVARIANT: Database migrations run before service deployment"

INV-087
- Statement: - INVARIANT: All services expose /metrics endpoint
- Applies To: Metadata/RUNBOOK_15_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_15_METADATA.md:L101-L101 "- INVARIANT: All services expose /metrics endpoint"

INV-088
- Statement: - [21.3 Invariant Result Schema](#213-invariant-result-schema)
- Applies To: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L45-L45 "- [21.3 Invariant Result Schema](#213-invariant-result-schema)"

INV-089
- Statement: - [21.6 Invariant Definitions by Domain](#216-invariant-definitions-by-domain)
- Applies To: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L48-L48 "- [21.6 Invariant Definitions by Domain](#216-invariant-definitions-by-domain)"

INV-090
- Statement: ### 20.3 Invariant Result Schema
- Applies To: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L14200-L14200 "### 20.3 Invariant Result Schema"

INV-091
- Statement: Each invariant check produces an `InvariantResult`:
- Applies To: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L14202-L14202 "Each invariant check produces an `InvariantResult`:"

INV-092
- Statement: invariant: string;
- Applies To: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L14280-L14280 "invariant: string;"

INV-093
- Statement: ### 20.6 Invariant Definitions by Domain
- Applies To: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L14288-L14288 "### 20.6 Invariant Definitions by Domain"

INV-094
- Statement: | Invariant | Check |
- Applies To: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L14292-L14292 "| Invariant | Check |"

INV-095
- Statement: | Invariant | Check |
- Applies To: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L14301-L14301 "| Invariant | Check |"

INV-096
- Statement: | Invariant | Check |
- Applies To: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L14310-L14310 "| Invariant | Check |"

INV-097
- Statement: | Invariant | Check |
- Applies To: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L14318-L14318 "| Invariant | Check |"

INV-098
- Statement: | Invariant | Check |
- Applies To: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L14326-L14326 "| Invariant | Check |"

INV-099
- Statement: When an invariant fails:
- Applies To: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L14334-L14334 "When an invariant fails:"

INV-100
- Statement: | Invariant Type | Default Severity |
- Applies To: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L14344-L14344 "| Invariant Type | Default Severity |"

INV-101
- Statement: - WARNING invariant failures trigger `warning` toast
- Applies To: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L14387-L14387 "- WARNING invariant failures trigger `warning` toast"

INV-102
- Statement: - Each invariant should have unit tests with passing and failing cases
- Applies To: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: 00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md:L14403-L14403 "- Each invariant should have unit tests with passing and failing cases"

INV-103
- Statement: - INVARIANT: All 23 sections are complete (no placeholders except Sections 7, 23)
- Applies To: Metadata/RUNBOOK_0_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_0_METADATA.md:L69-L69 "- INVARIANT: All 23 sections are complete (no placeholders except Sections 7, 23)"

INV-104
- Statement: - INVARIANT: Cross-references are valid (sections referenced actually exist)
- Applies To: Metadata/RUNBOOK_0_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_0_METADATA.md:L76-L76 "- INVARIANT: Cross-references are valid (sections referenced actually exist)"

INV-105
- Statement: - INVARIANT: LegalDocument schema is complete (Section 4)
- Applies To: Metadata/RUNBOOK_0_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_0_METADATA.md:L84-L84 "- INVARIANT: LegalDocument schema is complete (Section 4)"

INV-106
- Statement: - INVARIANT: Data models match database schema (Section 2 vs Runbook 2)
- Applies To: Metadata/RUNBOOK_0_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_0_METADATA.md:L92-L92 "- INVARIANT: Data models match database schema (Section 2 vs Runbook 2)"

INV-107
- Statement: - INVARIANT: Service specifications are complete (Sections 11-14)
- Applies To: Metadata/RUNBOOK_0_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_0_METADATA.md:L100-L100 "- INVARIANT: Service specifications are complete (Sections 11-14)"

INV-108
- Statement: - INVARIANT: Verification criteria exist for all runbooks (Section 19)
- Applies To: Metadata/RUNBOOK_0_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_0_METADATA.md:L108-L108 "- INVARIANT: Verification criteria exist for all runbooks (Section 19)"

INV-109
- Statement: - INVARIANT: Technology stack decisions are consistent (Section 15)
- Applies To: Metadata/RUNBOOK_0_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_0_METADATA.md:L118-L118 "- INVARIANT: Technology stack decisions are consistent (Section 15)"

INV-110
- Statement: - INVARIANT: Deployment models are clearly separated (Section 20)
- Applies To: Metadata/RUNBOOK_0_METADATA.md
- Enforcement point: UNSPECIFIED
- Proof/Test: UNSPECIFIED
- Source: Metadata/RUNBOOK_0_METADATA.md:L126-L126 "- INVARIANT: Deployment models are clearly separated (Section 20)"
