## Metadata Summary

### Purpose
Create production infrastructure for cloud deployment including auto-update server, Kubernetes configuration, monitoring dashboards, and incident response procedures.

### Produces (Artifacts)

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

### Consumes (Prerequisites)

**Required Runbooks:**
- Runbooks 3-6: Services must be containerizable
- Runbook 14: CI/CD for deployment automation

**Required Infrastructure:**
- AWS account (S3, CloudFront)
- Kubernetes cluster (cloud or on-premise)
- Prometheus/Grafana setup
- Sentry account (error tracking)

### Interfaces Touched

**Auto-Update Protocol:**

**Endpoint 1: Check for Updates**
- From: Desktop App → To: CloudFront Distribution
- Method: **GET /latest.yml**
- When: On app startup, every 24 hours, manual check
- Purpose: Retrieve latest version manifest to determine if update available

**Request Schema:**
```http
GET https://updates.factsway.com/latest.yml HTTP/1.1
Host: updates.factsway.com
User-Agent: FACTSWAY/1.0.0 (platform; build)
Accept: text/yaml, application/x-yaml
Cache-Control: no-cache
```

**Response Schemas:**

*Success (200 OK):*
```yaml
version: 1.0.1
releaseDate: '2024-12-26T10:00:00Z'
files:
  - url: https://updates.factsway.com/FACTSWAY-Setup-1.0.1.exe
    sha512: a1b2c3d4e5f6...
    size: 125829120
  - url: https://updates.factsway.com/FACTSWAY-Setup-1.0.1.dmg
    sha512: f6e5d4c3b2a1...
    size: 130023424
  - url: https://updates.factsway.com/FACTSWAY-Setup-1.0.1.AppImage
    sha512: 1a2b3c4d5e6f...
    size: 128974848
path: FACTSWAY-Setup-1.0.1.exe
sha512: a1b2c3d4e5f6...
releaseNotes: |
  - Bug fixes for citation parsing
  - Performance improvements
  - Updated dependencies
```

*Not Modified (304):*
- Headers: `ETag: "v1.0.0"`
- Body: Empty (use cached manifest)
- Purpose: Save bandwidth when manifest unchanged

*Not Found (404):*
```json
{
  "error": "Manifest not found",
  "code": "MANIFEST_NOT_FOUND"
}
```

*Rate Limited (429):*
```json
{
  "error": "Too many requests",
  "retryAfter": 60
}
```

*Server Error (500/503):*
```json
{
  "error": "CloudFront distribution unavailable",
  "code": "SERVICE_UNAVAILABLE"
}
```

**Endpoint 2: Download Installer**
- From: Desktop App → To: CloudFront Distribution
- Method: **GET /FACTSWAY-Setup-{version}.{ext}**
- When: After detecting new version in latest.yml
- Purpose: Download platform-specific installer binary

**Request Schema:**
```http
GET https://updates.factsway.com/FACTSWAY-Setup-1.0.1.exe HTTP/1.1
Host: updates.factsway.com
User-Agent: FACTSWAY/1.0.0 (Windows; x64)
Accept: application/octet-stream
Range: bytes=0-1048575 (optional, for resume support)
```

**Response Schemas:**

*Success (200 OK - Full Download):*
```http
HTTP/1.1 200 OK
Content-Type: application/octet-stream
Content-Length: 125829120
ETag: "a1b2c3d4e5f6"
Accept-Ranges: bytes
Cache-Control: public, max-age=31536000

[Binary installer data]
```

*Partial Content (206 - Resume Support):*
```http
HTTP/1.1 206 Partial Content
Content-Type: application/octet-stream
Content-Length: 1048576
Content-Range: bytes 0-1048575/125829120
ETag: "a1b2c3d4e5f6"

[Binary installer data chunk]
```

*Not Modified (304):*
- Condition: `If-None-Match: "a1b2c3d4e5f6"` matches ETag
- Purpose: Skip download if installer already cached

*Not Found (404):*
```json
{
  "error": "Installer not found for version 1.0.1",
  "code": "INSTALLER_NOT_FOUND"
}
```

*Range Not Satisfiable (416):*
```http
HTTP/1.1 416 Range Not Satisfiable
Content-Range: bytes */125829120

Range exceeds file size
```

*Rate Limited (429):*
```json
{
  "error": "Download rate limit exceeded",
  "retryAfter": 300
}
```

**Error Cases:**
- **Network timeout:** Retry with exponential backoff (1s, 2s, 4s, 8s)
- **Checksum mismatch:** Re-download from beginning, verify SHA512
- **Corrupted download:** Resume from last valid byte if 206 supported
- **CloudFront outage:** Fallback to direct S3 URL (if configured)

---

**Monitoring Endpoints:**

**Endpoint: Prometheus Metrics**
- From: Prometheus Server → To: All 8 FACTSWAY Services
- Method: **GET /metrics**
- When: Every 15 seconds (scrape interval)
- Purpose: Collect service metrics for monitoring and alerting

**Request Schema:**
```http
GET http://localhost:3001/metrics HTTP/1.1
Host: localhost:3001
User-Agent: Prometheus/2.45.0
Accept: text/plain; version=0.0.4
```

**Response Schema:**

*Success (200 OK):*
```http
HTTP/1.1 200 OK
Content-Type: text/plain; version=0.0.4; charset=utf-8

# HELP http_requests_total Total HTTP requests processed
# TYPE http_requests_total counter
http_requests_total{method="GET",endpoint="/api/templates",status="200"} 1523
http_requests_total{method="POST",endpoint="/api/cases",status="201"} 342
http_requests_total{method="GET",endpoint="/api/cases/:id",status="404"} 12
http_requests_total{method="POST",endpoint="/api/drafts",status="400"} 5

# HELP http_request_duration_seconds HTTP request latency in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="GET",endpoint="/api/templates",le="0.005"} 100
http_request_duration_seconds_bucket{method="GET",endpoint="/api/templates",le="0.01"} 450
http_request_duration_seconds_bucket{method="GET",endpoint="/api/templates",le="0.025"} 1200
http_request_duration_seconds_bucket{method="GET",endpoint="/api/templates",le="0.05"} 1450
http_request_duration_seconds_bucket{method="GET",endpoint="/api/templates",le="0.1"} 1500
http_request_duration_seconds_bucket{method="GET",endpoint="/api/templates",le="+Inf"} 1523
http_request_duration_seconds_sum{method="GET",endpoint="/api/templates"} 18.234
http_request_duration_seconds_count{method="GET",endpoint="/api/templates"} 1523

# HELP process_cpu_seconds_total Total user and system CPU time
# TYPE process_cpu_seconds_total counter
process_cpu_seconds_total 45.23

# HELP process_resident_memory_bytes Resident memory size in bytes
# TYPE process_resident_memory_bytes gauge
process_resident_memory_bytes 67108864

# HELP nodejs_heap_size_used_bytes Heap memory used
# TYPE nodejs_heap_size_used_bytes gauge
nodejs_heap_size_used_bytes 45678912

# HELP factsway_active_connections Current active database connections
# TYPE factsway_active_connections gauge
factsway_active_connections 3

# HELP factsway_db_query_duration_seconds Database query duration
# TYPE factsway_db_query_duration_seconds histogram
factsway_db_query_duration_seconds_bucket{query="SELECT",le="0.001"} 450
factsway_db_query_duration_seconds_bucket{query="SELECT",le="0.005"} 890
factsway_db_query_duration_seconds_bucket{query="SELECT",le="0.01"} 950
factsway_db_query_duration_seconds_bucket{query="SELECT",le="+Inf"} 980
factsway_db_query_duration_seconds_sum{query="SELECT"} 2.345
factsway_db_query_duration_seconds_count{query="SELECT"} 980
```

*Service Unavailable (503):*
```http
HTTP/1.1 503 Service Unavailable
Content-Type: text/plain

Service starting up, metrics not yet available
```

*Not Found (404):*
```http
HTTP/1.1 404 Not Found
Content-Type: text/plain

Metrics endpoint not configured (missing /metrics route)
```

**Metrics Categories:**
- **HTTP Metrics:** Request count, duration, status codes (per endpoint, method)
- **System Metrics:** CPU usage, memory usage, heap size
- **Database Metrics:** Active connections, query duration, query count
- **Application Metrics:** Active users, draft count, template count, export queue size

**Error Cases:**
- **Scrape timeout (>10s):** Prometheus marks target as down, triggers alert
- **Malformed metrics:** Prometheus rejects scrape, logs parse error
- **Service crash:** No /metrics response, Prometheus target shows as down

---

**Error Tracking:**

**Endpoint: Sentry Error Event**
- From: All 8 FACTSWAY Services → To: Sentry API
- Method: **POST /api/{project}/store/**
- When: Uncaught exceptions, handled errors, performance issues
- Purpose: Centralized error tracking with stack traces and context

**Request Schema:**
```http
POST https://sentry.io/api/123456/store/ HTTP/1.1
Host: sentry.io
Content-Type: application/json
X-Sentry-Auth: Sentry sentry_version=7, sentry_key=abc123, sentry_client=factsway-records-service/1.0.0
User-Agent: factsway-records-service/1.0.0

{
  "event_id": "a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5",
  "timestamp": "2024-12-26T10:30:45.123Z",
  "platform": "node",
  "sdk": {
    "name": "sentry.javascript.node",
    "version": "7.91.0"
  },
  "logger": "records-service",
  "level": "error",
  "server_name": "factsway-records-service-pod-1",
  "release": "factsway@1.0.0",
  "environment": "production",
  "exception": {
    "values": [
      {
        "type": "DatabaseError",
        "value": "SQLITE_CONSTRAINT: UNIQUE constraint failed: templates.id",
        "stacktrace": {
          "frames": [
            {
              "filename": "src/repositories/template.repository.ts",
              "function": "create",
              "lineno": 42,
              "colno": 15,
              "context_line": "    await this.db.run(sql, params);",
              "pre_context": [
                "  async create(template: Template): Promise<Template> {",
                "    const sql = `INSERT INTO templates ...`;"
              ],
              "post_context": [
                "    return template;",
                "  }"
              ]
            },
            {
              "filename": "src/api/templates.routes.ts",
              "function": "createTemplate",
              "lineno": 25,
              "colno": 30
            }
          ]
        }
      }
    ]
  },
  "request": {
    "url": "http://localhost:3001/api/templates",
    "method": "POST",
    "headers": {
      "content-type": "application/json",
      "user-agent": "FACTSWAY Desktop/1.0.0"
    },
    "data": {
      "title": "Motion to Dismiss",
      "jurisdiction": "federal"
    }
  },
  "user": {
    "id": "user-123",
    "username": "john.doe@lawfirm.com"
  },
  "tags": {
    "service": "records-service",
    "endpoint": "/api/templates",
    "method": "POST"
  },
  "extra": {
    "template_id": "attempt-abc123",
    "database_path": "/data/factsway.db"
  },
  "breadcrumbs": [
    {
      "timestamp": "2024-12-26T10:30:44.000Z",
      "category": "http",
      "message": "POST /api/templates",
      "level": "info"
    },
    {
      "timestamp": "2024-12-26T10:30:44.500Z",
      "category": "db",
      "message": "Preparing SQL INSERT",
      "level": "debug"
    },
    {
      "timestamp": "2024-12-26T10:30:45.120Z",
      "category": "db",
      "message": "Executing SQL INSERT",
      "level": "debug"
    }
  ]
}
```

**Response Schemas:**

*Success (200 OK):*
```json
{
  "id": "a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5",
  "url": "https://sentry.io/organizations/factsway/issues/123456/"
}
```

*Bad Request (400):*
```json
{
  "error": "Invalid event schema",
  "detail": "Missing required field: exception"
}
```

*Unauthorized (401):*
```json
{
  "error": "Invalid Sentry DSN or API key",
  "detail": "sentry_key not found in project"
}
```

*Forbidden (403):*
```json
{
  "error": "Project quota exceeded",
  "detail": "Event quota limit reached for billing period"
}
```

*Rate Limited (429):*
```json
{
  "error": "Too many events",
  "retryAfter": 60,
  "detail": "Rate limit: 100 events/minute"
}
```

*Server Error (500):*
```json
{
  "error": "Sentry ingestion error",
  "detail": "Internal error processing event"
}
```

**Event Types:**
- **Exceptions:** Uncaught errors, promise rejections, fatal crashes
- **Errors:** Handled errors (validation failures, API errors)
- **Performance:** Slow queries, high memory usage, slow HTTP requests
- **Messages:** Info-level logs, warnings, debug traces (if configured)

**Error Cases:**
- **Network failure:** Queue events locally, retry with exponential backoff
- **Quota exceeded:** Drop events or downgrade to error-only (no info/debug)
- **Invalid DSN:** Disable Sentry, log warning to console
- **Large payloads:** Truncate breadcrumbs/extra data to fit Sentry limits (<200KB)

### Invariants

**Deployment Invariants:**

- INVARIANT: All services deployed with same version
  - Rule: All 8 services have matching version tags
  - Enforced by: Deployment script checks version consistency
  - Purpose: No version mismatches across services
  - Violation: Service A on v1.0.0, Service B on v1.0.1
  - Detection: Health check reports version mismatch
  - Recovery: Roll back or roll forward to consistent version

- INVARIANT: Database migrations run before service deployment
  - Rule: Migration job completes successfully before pods start
  - Enforced by: Kubernetes Job dependency
  - Purpose: Services never query non-existent tables
  - Violation: Services crash on first query
  - Detection: Crash loop in pods
  - Recovery: Run migrations manually, restart pods

**Monitoring Invariants:**

- INVARIANT: All services expose /metrics endpoint
  - Rule: Every service has Prometheus metrics
  - Enforced by: Code review, deployment checklist
  - Purpose: Complete observability
  - Violation: Service metrics missing from Grafana
  - Detection: No data in dashboard for service
  - Recovery: Add /metrics endpoint, redeploy

### Verification Gates

**Auto-Update Server:**
- Command: `curl https://updates.factsway.com/latest.yml`
- Expected: YAML manifest with version and download URLs
- Purpose: Verify update server operational

**Kubernetes Deployment:**
- Command: `kubectl get pods -n factsway-production`
- Expected: All pods in "Running" state (24 pods: 8 services × 3 replicas)
- Purpose: Verify services deployed

**Monitoring:**
- Command: Open Grafana dashboard
- Expected: Metrics flowing, no gaps in graphs
- Purpose: Verify monitoring working

**Alerting:**
- Command: Stop a service, wait 2 minutes
- Expected: Alert fires (PagerDuty/Slack notification)
- Purpose: Verify alerts working

### Risks

**Infrastructure Risks:**

- **Risk:** Auto-update server down (S3 outage)
  - Severity: MEDIUM
  - Likelihood: LOW (S3 is highly available)
  - Impact: Users can't update, stuck on old version
  - Mitigation: Multi-region S3 bucket, fallback URL
  - Detection: CloudWatch alarms, user reports
  - Recovery: Wait for S3 recovery, redirect to fallback

- **Risk:** Kubernetes cluster capacity exhausted
  - Severity: HIGH
  - Likelihood: MEDIUM (traffic spikes)
  - Impact: Can't scale services, requests fail
  - Mitigation: Horizontal pod autoscaling, cluster autoscaling
  - Detection: CPU/memory alerts, pending pods
  - Recovery: Add nodes, scale down non-critical services

**Operational Risks:**

- **Risk:** Alert fatigue (too many false positives)
  - Severity: MEDIUM
  - Likelihood: HIGH (poorly tuned alerts)
  - Impact: Real incidents missed, on-call ignores alerts
  - Mitigation: Alert tuning, severity levels, escalation policy
  - Detection: On-call complaints, missed incidents
  - Recovery: Review and tune alert thresholds

## Template Notes

**Implementation Priority:** MEDIUM - Cloud/enterprise deployment (not blocking desktop)

**Before Starting Implementation:**
1. Desktop deployment (Runbook 10) must work perfectly
2. All services (Runbooks 3-6) must be containerizable
3. Kubernetes cluster available (cloud or on-premise)
4. Monitoring infrastructure (Prometheus, Grafana) set up

**LLM-Assisted Implementation Strategy:**

**Step 1: Auto-Update Server**
- Set up S3 bucket for installers and manifests
- Configure CloudFront for fast global downloads
- Test update mechanism (app downloads new version)

**Step 2: Kubernetes Configuration**
- Create namespace for production environment
- Deploy PostgreSQL StatefulSet (replaces SQLite)
- Deploy all 8 services as Deployments (3 replicas each)
- Configure Ingress (TLS, routing)

**Step 3: Database Migration Job**
- Create Kubernetes Job to run migrations
- Job must complete before services start
- Handle migration failures gracefully

**Step 4: Monitoring**
- Configure Prometheus to scrape /metrics from all services
- Create Grafana dashboards (service health, request rate, errors)
- Set up alert rules (service down, high error rate, slow response)

**Step 5: Error Tracking**
- Integrate Sentry in all services
- Test error reporting (trigger error, verify appears in Sentry)

**Step 6: Incident Response**
- Write incident response procedures (on-call runbook)
- Document rollback procedures
- Test recovery scenarios

**Critical Invariants to Enforce:**
- **Version consistency (HARD):** All 8 services deployed with same version tag
- **Migrations before services (HARD):** Migration Job completes before pods start
- **Metrics exposed (HARD):** All services have /metrics endpoint
- **Alert coverage (HARD):** All critical services have alerts (service down, high error rate)

**Common LLM Pitfalls to Avoid:**
1. **Don't skip migration job:** Services crash if tables don't exist
2. **Don't ignore monitoring:** Production issues invisible without metrics
3. **Don't forget TLS:** Cloud deployment requires HTTPS (Ingress configuration)
4. **Don't skip incident procedures:** On-call engineer needs runbook

**Auto-Update Server Checklist:**
- [ ] S3 bucket operational
- [ ] CloudFront distribution configured
- [ ] Update manifests deployed
- [ ] Desktop app updates successfully

**Kubernetes Deployment Checklist:**
- [ ] Namespace created
- [ ] PostgreSQL deployed (StatefulSet)
- [ ] All 8 services deployed (Deployments, 3 replicas each)
- [ ] Migration Job completes successfully
- [ ] Ingress configured (TLS, routing)
- [ ] All pods in "Running" state

**Monitoring Checklist:**
- [ ] Prometheus scraping all services
- [ ] Grafana dashboards created
- [ ] Alert rules configured
- [ ] Test alert fires successfully (stop service, verify PagerDuty/Slack)

**Error Tracking Checklist:**
- [ ] Sentry integrated in all services
- [ ] Test error reported successfully
- [ ] Error includes stack trace and context

**Incident Response Checklist:**
- [ ] On-call runbook written
- [ ] Rollback procedures documented
- [ ] Test recovery (rollback deployment, verify services recover)

**Validation Checklist (Production Readiness):**
- [ ] Auto-update server operational
- [ ] Kubernetes deployment successful
- [ ] All services healthy
- [ ] Monitoring operational
- [ ] Alerts firing correctly
- [ ] Error tracking working
- [ ] Incident procedures documented
- [ ] All verification gates executed and passed

**Production Readiness:**
- This runbook validates production readiness
- All previous runbooks (1-14) must be complete and tested
- Production deployment is the final validation gate

---

**End of Metadata for Batch 3 (Runbooks 11-15)**

---

**End of Metadata for Runbook 15**
