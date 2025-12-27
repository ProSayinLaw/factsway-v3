## Purpose
Create production infrastructure for cloud deployment including auto-update server, Kubernetes configuration, monitoring dashboards, and incident response procedures.

## Produces (Artifacts)
**Auto-Update Server:**
- Infrastructure: AWS S3 + CloudFront
  - Storage: S3 bucket for update manifests and installers
  - CDN: CloudFront distribution for fast downloads
- File: `infrastructure/cloudfront/updates-distribution.yml` (~100 lines)
  - Purpose: CloudFormation template for update server

**Kubernetes Configuration (for cloud/enterprise):**
- File: `infrastructure/kubernetes/production/namespace.yaml` (~20 lines)
- File: `infrastructure/kubernetes/production/postgres.yaml` (~150 lines)
  - Purpose: PostgreSQL StatefulSet for database
- File: `infrastructure/kubernetes/production/records-service.yaml` (~100 lines)
  - Purpose: Records Service deployment (3 replicas)
- File: `infrastructure/kubernetes/production/ingestion-service.yaml` (~100 lines)
  - Purpose: Ingestion Service deployment (3 replicas)
- (... 6 more service deployments)
- File: `infrastructure/kubernetes/production/ingress.yaml` (~80 lines)
  - Purpose: Ingress configuration (TLS, routing)

**Monitoring:**
- File: `infrastructure/monitoring/prometheus-config.yaml` (~200 lines)
  - Purpose: Prometheus metrics collection
- File: `infrastructure/monitoring/grafana-dashboard.json` (~500 lines)
  - Purpose: Grafana dashboard (service health, request rate, errors)
- File: `infrastructure/monitoring/alerts.yml` (~150 lines)
  - Purpose: Alert rules (service down, high error rate, slow response)

**Sentry Integration:**
- File: `services/shared-utils/src/monitoring/sentry.ts` (~100 lines)
  - Purpose: Error tracking initialization

**Incident Response:**
- File: `docs/operations/incident-response.md` (~20 pages)
  - Purpose: On-call procedures, runbooks, rollback procedures

**Total:** ~1,500 lines configuration + 20 pages documentation

## Consumes (Prereqs)
**Required Runbooks:**
- Runbooks 3-6: Services must be containerizable
- Runbook 14: CI/CD for deployment automation

**Required Infrastructure:**
- AWS account (S3, CloudFront)
- Kubernetes cluster (cloud or on-premise)
- Prometheus/Grafana setup
- Sentry account (error tracking)

## Interfaces Touched
- REST endpoints
  - GET /latest (Source: Metadata/RUNBOOK_15_METADATA.md:L60-L60) "- From: Desktop App → To: CloudFront → **GET /latest.yml**"
  - GET /FACTSWAY-Setup-1 (Source: Metadata/RUNBOOK_15_METADATA.md:L65-L65) "- From: Desktop App → To: CloudFront → **GET /FACTSWAY-Setup-1.0.1.exe**"
  - GET /metrics (Source: Metadata/RUNBOOK_15_METADATA.md:L70-L70) "- From: Prometheus → To: Services → **GET /metrics**"
  - POST /api/{project}/store/ (Source: Metadata/RUNBOOK_15_METADATA.md:L75-L75) "- From: Services → To: Sentry API → **POST /api/{project}/store/**"
- IPC channels/events (if any)
  - - Handle migration failures gracefully (Source: Metadata/RUNBOOK_15_METADATA.md:L187-L187) "- Handle migration failures gracefully"
- Filesystem paths/formats
  - updates-distribution.yml (Source: Metadata/RUNBOOK_15_METADATA.md:L12-L12) "- File: `infrastructure/cloudfront/updates-distribution.yml` (~100 lines)"
  - namespace.yaml (Source: Metadata/RUNBOOK_15_METADATA.md:L16-L16) "- File: `infrastructure/kubernetes/production/namespace.yaml` (~20 lines)"
  - postgres.yaml (Source: Metadata/RUNBOOK_15_METADATA.md:L17-L17) "- File: `infrastructure/kubernetes/production/postgres.yaml` (~150 lines)"
  - records-service.yaml (Source: Metadata/RUNBOOK_15_METADATA.md:L19-L19) "- File: `infrastructure/kubernetes/production/records-service.yaml` (~100 lines)"
  - ingestion-service.yaml (Source: Metadata/RUNBOOK_15_METADATA.md:L21-L21) "- File: `infrastructure/kubernetes/production/ingestion-service.yaml` (~100 lines)"
  - ingress.yaml (Source: Metadata/RUNBOOK_15_METADATA.md:L24-L24) "- File: `infrastructure/kubernetes/production/ingress.yaml` (~80 lines)"
  - prometheus-config.yaml (Source: Metadata/RUNBOOK_15_METADATA.md:L28-L28) "- File: `infrastructure/monitoring/prometheus-config.yaml` (~200 lines)"
  - grafana-dashboard.json (Source: Metadata/RUNBOOK_15_METADATA.md:L30-L30) "- File: `infrastructure/monitoring/grafana-dashboard.json` (~500 lines)"
  - alerts.yml (Source: Metadata/RUNBOOK_15_METADATA.md:L32-L32) "- File: `infrastructure/monitoring/alerts.yml` (~150 lines)"
  - incident-response.md (Source: Metadata/RUNBOOK_15_METADATA.md:L40-L40) "- File: `docs/operations/incident-response.md` (~20 pages)"
  - latest.yml (Source: Metadata/RUNBOOK_15_METADATA.md:L60-L60) "- From: Desktop App → To: CloudFront → **GET /latest.yml**"
  - latest.yml (Source: Metadata/RUNBOOK_15_METADATA.md:L112-L112) "- Command: `curl https://updates.factsway.com/latest.yml`"
- Process lifecycle (if any)
  - UNSPECIFIED
  - TODO: Document process lifecycle (Metadata/RUNBOOK_15_METADATA.md:L1-L266)

## Contracts Defined or Used
- REST GET /latest (Source: Metadata/RUNBOOK_15_METADATA.md:L60-L60) "- From: Desktop App → To: CloudFront → **GET /latest.yml**"
- REST GET /FACTSWAY-Setup-1 (Source: Metadata/RUNBOOK_15_METADATA.md:L65-L65) "- From: Desktop App → To: CloudFront → **GET /FACTSWAY-Setup-1.0.1.exe**"
- REST GET /metrics (Source: Metadata/RUNBOOK_15_METADATA.md:L70-L70) "- From: Prometheus → To: Services → **GET /metrics**"
- REST POST /api/{project}/store/ (Source: Metadata/RUNBOOK_15_METADATA.md:L75-L75) "- From: Services → To: Sentry API → **POST /api/{project}/store/**"
- IPC - Handle migration failures gracefully (Source: Metadata/RUNBOOK_15_METADATA.md:L187-L187) "- Handle migration failures gracefully"
- File updates-distribution.yml (Source: Metadata/RUNBOOK_15_METADATA.md:L12-L12) "- File: `infrastructure/cloudfront/updates-distribution.yml` (~100 lines)"
- File namespace.yaml (Source: Metadata/RUNBOOK_15_METADATA.md:L16-L16) "- File: `infrastructure/kubernetes/production/namespace.yaml` (~20 lines)"
- File postgres.yaml (Source: Metadata/RUNBOOK_15_METADATA.md:L17-L17) "- File: `infrastructure/kubernetes/production/postgres.yaml` (~150 lines)"
- File records-service.yaml (Source: Metadata/RUNBOOK_15_METADATA.md:L19-L19) "- File: `infrastructure/kubernetes/production/records-service.yaml` (~100 lines)"
- File ingestion-service.yaml (Source: Metadata/RUNBOOK_15_METADATA.md:L21-L21) "- File: `infrastructure/kubernetes/production/ingestion-service.yaml` (~100 lines)"
- File ingress.yaml (Source: Metadata/RUNBOOK_15_METADATA.md:L24-L24) "- File: `infrastructure/kubernetes/production/ingress.yaml` (~80 lines)"
- File prometheus-config.yaml (Source: Metadata/RUNBOOK_15_METADATA.md:L28-L28) "- File: `infrastructure/monitoring/prometheus-config.yaml` (~200 lines)"
- File grafana-dashboard.json (Source: Metadata/RUNBOOK_15_METADATA.md:L30-L30) "- File: `infrastructure/monitoring/grafana-dashboard.json` (~500 lines)"
- File alerts.yml (Source: Metadata/RUNBOOK_15_METADATA.md:L32-L32) "- File: `infrastructure/monitoring/alerts.yml` (~150 lines)"
- File incident-response.md (Source: Metadata/RUNBOOK_15_METADATA.md:L40-L40) "- File: `docs/operations/incident-response.md` (~20 pages)"
- File latest.yml (Source: Metadata/RUNBOOK_15_METADATA.md:L60-L60) "- From: Desktop App → To: CloudFront → **GET /latest.yml**"
- File latest.yml (Source: Metadata/RUNBOOK_15_METADATA.md:L112-L112) "- Command: `curl https://updates.factsway.com/latest.yml`"

## Invariants Relied On
- - INVARIANT: All services deployed with same version (Source: Metadata/RUNBOOK_15_METADATA.md:L83-L83) "- INVARIANT: All services deployed with same version"
- - INVARIANT: Database migrations run before service deployment (Source: Metadata/RUNBOOK_15_METADATA.md:L91-L91) "- INVARIANT: Database migrations run before service deployment"
- - INVARIANT: All services expose /metrics endpoint (Source: Metadata/RUNBOOK_15_METADATA.md:L101-L101) "- INVARIANT: All services expose /metrics endpoint"

## Verification Gate (Commands + Expected Outputs)
- - Purpose: Verify update server operational (Source: Metadata/RUNBOOK_15_METADATA.md:L114-L114) "- Purpose: Verify update server operational"
- - Purpose: Verify services deployed (Source: Metadata/RUNBOOK_15_METADATA.md:L119-L119) "- Purpose: Verify services deployed"
- - Purpose: Verify monitoring working (Source: Metadata/RUNBOOK_15_METADATA.md:L124-L124) "- Purpose: Verify monitoring working"
- - Purpose: Verify alerts working (Source: Metadata/RUNBOOK_15_METADATA.md:L129-L129) "- Purpose: Verify alerts working"
- - Test error reporting (trigger error, verify appears in Sentry) (Source: Metadata/RUNBOOK_15_METADATA.md:L196-L196) "- Test error reporting (trigger error, verify appears in Sentry)"
- - [ ] Test alert fires successfully (stop service, verify PagerDuty/Slack) (Source: Metadata/RUNBOOK_15_METADATA.md:L233-L233) "- [ ] Test alert fires successfully (stop service, verify PagerDuty/Slack)"
- - [ ] Test recovery (rollback deployment, verify services recover) (Source: Metadata/RUNBOOK_15_METADATA.md:L243-L243) "- [ ] Test recovery (rollback deployment, verify services recover)"

## Risks / Unknowns (TODOs)
- - **Risk:** Auto-update server down (S3 outage) (Source: Metadata/RUNBOOK_15_METADATA.md:L135-L135) "- **Risk:** Auto-update server down (S3 outage)"
- - **Risk:** Kubernetes cluster capacity exhausted (Source: Metadata/RUNBOOK_15_METADATA.md:L143-L143) "- **Risk:** Kubernetes cluster capacity exhausted"
- - **Risk:** Alert fatigue (too many false positives) (Source: Metadata/RUNBOOK_15_METADATA.md:L153-L153) "- **Risk:** Alert fatigue (too many false positives)"
