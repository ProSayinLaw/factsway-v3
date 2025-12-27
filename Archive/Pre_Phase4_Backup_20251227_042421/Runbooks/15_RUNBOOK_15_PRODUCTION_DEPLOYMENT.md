# Runbook 15: Production Deployment & Monitoring

**Phase:** Operations (Final)  
**Estimated Time:** 8-12 hours  
**Prerequisites:** Runbooks 1-14 complete (fully automated pipeline)  
**Depends On:** Runbook 0 Sections 22, 24  
**Enables:** Production operations, enterprise deployment, monitoring

---

## Objective

Create **production deployment infrastructure** and **monitoring systems** for Desktop, Cloud, and Enterprise deployments including logging, metrics, error tracking, health monitoring, and incident response procedures.

**Success Criteria:**
- ✅ Desktop auto-update server operational
- ✅ Cloud deployment (Kubernetes) automated
- ✅ Enterprise deployment (Docker Compose) documented
- ✅ Logging aggregation configured
- ✅ Metrics collection & dashboards created
- ✅ Error tracking (Sentry) integrated
- ✅ Health monitoring & alerting configured
- ✅ Incident response runbook created
- ✅ Rollback procedures documented

---

## Context from Runbook 0

**Referenced Sections:**
- **Section 22:** Deployment Models
  - **Section 22.2:** Desktop deployment
  - **Section 22.3:** Cloud deployment (Kubernetes)
  - **Section 22.4:** Enterprise deployment (Docker Compose)
- **Section 24:** Operations & Monitoring
  - **Section 24.1:** Logging strategy
  - **Section 24.2:** Metrics & observability
  - **Section 24.3:** Error tracking
  - **Section 24.4:** Incident response

**Key Principle from Runbook 0:**
> "You can't improve what you don't measure. Every production system needs observability: logs for debugging, metrics for trends, alerts for incidents. When something breaks at 2am, the monitoring system should wake you up with enough context to fix it quickly."

---

## Current State

**What exists:**
- ✅ Complete application (Runbooks 1-13)
- ✅ Automated CI/CD (Runbook 14)
- ❌ No production deployment infrastructure
- ❌ No monitoring systems
- ❌ No logging aggregation
- ❌ No error tracking
- ❌ No incident response procedures

**What this creates:**
- ✅ Auto-update server (CloudFront + S3)
- ✅ Kubernetes production deployment
- ✅ Enterprise deployment templates
- ✅ Logging infrastructure (CloudWatch/ELK)
- ✅ Metrics dashboards (Grafana)
- ✅ Error tracking (Sentry)
- ✅ Health check monitoring
- ✅ Alerting rules (PagerDuty)
- ✅ Incident response playbook

---

## Task 1: Desktop Auto-Update Server

### 1.1 CloudFront + S3 Setup

**File:** `infrastructure/cloudfront/updates-distribution.yml`

**Action:** CREATE

**Purpose:** CloudFormation template for update server

**Content:**
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'FACTSWAY Auto-Update Server (CloudFront + S3)'

Resources:
  UpdatesBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: factsway-updates
      VersioningConfiguration:
        Status: Enabled
      PublicAccessBlockConfiguration:
        BlockPublicAcls: false
        BlockPublicPolicy: false
        IgnorePublicAcls: false
        RestrictPublicBuckets: false
      CorsConfiguration:
        CorsRules:
          - AllowedOrigins:
              - '*'
            AllowedMethods:
              - GET
              - HEAD
            AllowedHeaders:
              - '*'
  
  UpdatesBucketPolicy:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref UpdatesBucket
      PolicyDocument:
        Statement:
          - Sid: PublicReadGetObject
            Effect: Allow
            Principal: '*'
            Action:
              - s3:GetObject
            Resource: !Sub '${UpdatesBucket.Arn}/*'
  
  UpdatesCDN:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Enabled: true
        Comment: FACTSWAY Auto-Update Distribution
        DefaultRootObject: latest.yml
        Aliases:
          - updates.factsway.com
        ViewerCertificate:
          AcmCertificateArn: !Ref SSLCertificate
          SslSupportMethod: sni-only
          MinimumProtocolVersion: TLSv1.2_2021
        Origins:
          - Id: S3-factsway-updates
            DomainName: !GetAtt UpdatesBucket.RegionalDomainName
            S3OriginConfig:
              OriginAccessIdentity: ''
        DefaultCacheBehavior:
          TargetOriginId: S3-factsway-updates
          ViewerProtocolPolicy: redirect-to-https
          AllowedMethods:
            - GET
            - HEAD
            - OPTIONS
          CachedMethods:
            - GET
            - HEAD
          ForwardedValues:
            QueryString: false
            Cookies:
              Forward: none
          MinTTL: 0
          DefaultTTL: 3600
          MaxTTL: 86400
          Compress: true
        PriceClass: PriceClass_100
  
  SSLCertificate:
    Type: AWS::CertificateManager::Certificate
    Properties:
      DomainName: updates.factsway.com
      ValidationMethod: DNS
      DomainValidationOptions:
        - DomainName: updates.factsway.com
          HostedZoneId: !Ref HostedZone

Outputs:
  UpdatesURL:
    Description: Updates CDN URL
    Value: !Sub 'https://${UpdatesCDN.DomainName}'
  
  UpdatesBucketName:
    Description: S3 Bucket for updates
    Value: !Ref UpdatesBucket
```

---

## Task 2: Kubernetes Production Deployment

### 2.1 Kubernetes Production Manifests

**File:** `infrastructure/kubernetes/production/namespace.yaml`

**Action:** CREATE

**Content:**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: factsway-prod
  labels:
    environment: production
    app: factsway
```

---

**File:** `infrastructure/kubernetes/production/postgres.yaml`

**Action:** CREATE

**Purpose:** PostgreSQL database for cloud deployment

**Content:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-credentials
  namespace: factsway-prod
type: Opaque
stringData:
  POSTGRES_PASSWORD: CHANGE_ME_IN_PRODUCTION
  POSTGRES_USER: factsway_prod
  POSTGRES_DB: factsway_prod

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: factsway-prod
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 100Gi
  storageClassName: gp3

---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: factsway-prod
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:15
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: postgres-credentials
                  key: POSTGRES_USER
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: postgres-credentials
                  key: POSTGRES_PASSWORD
            - name: POSTGRES_DB
              valueFrom:
                secretKeyRef:
                  name: postgres-credentials
                  key: POSTGRES_DB
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
          resources:
            requests:
              memory: "2Gi"
              cpu: "1000m"
            limits:
              memory: "4Gi"
              cpu: "2000m"
      volumes:
        - name: postgres-storage
          persistentVolumeClaim:
            claimName: postgres-pvc

---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: factsway-prod
spec:
  selector:
    app: postgres
  ports:
    - port: 5432
      targetPort: 5432
  type: ClusterIP
```

---

**File:** `infrastructure/kubernetes/production/records-service.yaml`

**Action:** CREATE

**Purpose:** Records Service deployment

**Content:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: records-service
  namespace: factsway-prod
spec:
  replicas: 3
  selector:
    matchLabels:
      app: records-service
  template:
    metadata:
      labels:
        app: records-service
    spec:
      containers:
        - name: records-service
          image: factsway/records-service:latest
          ports:
            - containerPort: 3001
          env:
            - name: DEPLOYMENT_ENV
              value: "cloud"
            - name: PORT
              value: "3001"
            - name: SERVICE_NAME
              value: "records"
            - name: LOG_LEVEL
              value: "info"
            - name: POSTGRES_HOST
              value: "postgres.factsway-prod.svc.cluster.local"
            - name: POSTGRES_PORT
              value: "5432"
            - name: POSTGRES_DB
              valueFrom:
                secretKeyRef:
                  name: postgres-credentials
                  key: POSTGRES_DB
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: postgres-credentials
                  key: POSTGRES_USER
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: postgres-credentials
                  key: POSTGRES_PASSWORD
            # Service URLs
            - name: RECORDS_SERVICE_URL
              value: "http://records-service.factsway-prod.svc.cluster.local:3001"
            - name: INGESTION_SERVICE_URL
              value: "http://ingestion-service.factsway-prod.svc.cluster.local:3002"
            - name: EXPORT_SERVICE_URL
              value: "http://export-service.factsway-prod.svc.cluster.local:3003"
            - name: CASEBLOCK_SERVICE_URL
              value: "http://caseblock-service.factsway-prod.svc.cluster.local:3004"
            - name: SIGNATURE_SERVICE_URL
              value: "http://signature-service.factsway-prod.svc.cluster.local:3005"
            - name: FACTS_SERVICE_URL
              value: "http://facts-service.factsway-prod.svc.cluster.local:3006"
            - name: EXHIBITS_SERVICE_URL
              value: "http://exhibits-service.factsway-prod.svc.cluster.local:3007"
            - name: CASELAW_SERVICE_URL
              value: "http://caselaw-service.factsway-prod.svc.cluster.local:3008"
          livenessProbe:
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 10
            periodSeconds: 5
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "500m"

---
apiVersion: v1
kind: Service
metadata:
  name: records-service
  namespace: factsway-prod
spec:
  selector:
    app: records-service
  ports:
    - port: 3001
      targetPort: 3001
  type: ClusterIP
```

---

### 2.2 Kubernetes Deployment Script

**File:** `infrastructure/kubernetes/deploy.sh`

**Action:** CREATE

**Purpose:** Deploy to Kubernetes cluster

**Content:**
```bash
#!/bin/bash
set -e

# Deploy FACTSWAY to Kubernetes
#
# Usage:
#   ./deploy.sh [environment]
#
# Environments: staging, production

ENVIRONMENT=${1:-staging}
NAMESPACE="factsway-${ENVIRONMENT}"

echo "========================================="
echo "Deploying FACTSWAY to ${ENVIRONMENT}"
echo "========================================="
echo ""

# Create namespace
echo "Creating namespace: ${NAMESPACE}..."
kubectl apply -f ${ENVIRONMENT}/namespace.yaml

# Deploy PostgreSQL
echo "Deploying PostgreSQL..."
kubectl apply -f ${ENVIRONMENT}/postgres.yaml

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
kubectl wait --for=condition=ready pod -l app=postgres -n ${NAMESPACE} --timeout=300s

# Run database migrations
echo "Running database migrations..."
kubectl run migrations \
  --image=factsway/records-service:latest \
  --restart=Never \
  --namespace=${NAMESPACE} \
  --env="DATABASE_URL=postgresql://factsway_prod:PASSWORD@postgres:5432/factsway_prod" \
  --command -- npm run migrate:up

# Deploy services
echo "Deploying services..."
kubectl apply -f ${ENVIRONMENT}/records-service.yaml
kubectl apply -f ${ENVIRONMENT}/ingestion-service.yaml
kubectl apply -f ${ENVIRONMENT}/export-service.yaml
kubectl apply -f ${ENVIRONMENT}/caseblock-service.yaml
kubectl apply -f ${ENVIRONMENT}/signature-service.yaml
kubectl apply -f ${ENVIRONMENT}/facts-service.yaml
kubectl apply -f ${ENVIRONMENT}/exhibits-service.yaml
kubectl apply -f ${ENVIRONMENT}/caselaw-service.yaml

# Wait for services to be ready
echo "Waiting for services to be ready..."
kubectl wait --for=condition=available deployment --all -n ${NAMESPACE} --timeout=300s

# Deploy ingress
echo "Deploying ingress..."
kubectl apply -f ${ENVIRONMENT}/ingress.yaml

echo ""
echo "========================================="
echo "Deployment complete!"
echo "========================================="
echo ""

# Show service status
kubectl get pods -n ${NAMESPACE}
kubectl get services -n ${NAMESPACE}
```

---

## Task 3: Monitoring & Logging

### 3.1 Prometheus Metrics

**File:** `infrastructure/monitoring/prometheus-config.yaml`

**Action:** CREATE

**Purpose:** Prometheus scrape configuration

**Content:**
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  # Records Service
  - job_name: 'records-service'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - factsway-prod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        regex: records-service
        action: keep
      - source_labels: [__meta_kubernetes_pod_ip]
        target_label: __address__
        replacement: '${1}:3001'
    metrics_path: /metrics
  
  # Ingestion Service
  - job_name: 'ingestion-service'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - factsway-prod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        regex: ingestion-service
        action: keep
      - source_labels: [__meta_kubernetes_pod_ip]
        target_label: __address__
        replacement: '${1}:3002'
    metrics_path: /metrics
  
  # Add similar configs for other 6 services...

rule_files:
  - /etc/prometheus/alerts.yml

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093
```

---

### 3.2 Grafana Dashboard

**File:** `infrastructure/monitoring/grafana-dashboard.json`

**Action:** CREATE

**Purpose:** Service health dashboard

**Content:**
```json
{
  "dashboard": {
    "title": "FACTSWAY Services Overview",
    "panels": [
      {
        "title": "Service Health",
        "targets": [
          {
            "expr": "up{job=~\".*-service\"}"
          }
        ],
        "type": "stat"
      },
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])"
          }
        ],
        "type": "graph"
      }
    ]
  }
}
```

---

### 3.3 Alert Rules

**File:** `infrastructure/monitoring/alerts.yml`

**Action:** CREATE

**Purpose:** Prometheus alerting rules

**Content:**
```yaml
groups:
  - name: factsway_alerts
    interval: 30s
    rules:
      # Service Down
      - alert: ServiceDown
        expr: up{job=~".*-service"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.job }} is down"
          description: "{{ $labels.job }} has been down for more than 2 minutes"
      
      # High Error Rate
      - alert: HighErrorRate
        expr: |
          rate(http_requests_total{status=~"5.."}[5m])
          /
          rate(http_requests_total[5m])
          > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate on {{ $labels.job }}"
          description: "Error rate is {{ $value | humanizePercentage }}"
      
      # Slow Response Time
      - alert: SlowResponseTime
        expr: |
          histogram_quantile(0.95,
            rate(http_request_duration_seconds_bucket[5m])
          ) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Slow response time on {{ $labels.job }}"
          description: "95th percentile response time is {{ $value }}s"
      
      # Database Connection Issues
      - alert: DatabaseConnectionErrors
        expr: |
          rate(database_connection_errors_total[5m]) > 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Database connection errors on {{ $labels.job }}"
          description: "{{ $value }} connection errors per second"
      
      # Disk Space Low
      - alert: DiskSpaceLow
        expr: |
          (node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Disk space low on {{ $labels.instance }}"
          description: "Only {{ $value | humanizePercentage }} disk space remaining"
```

---

## Task 4: Error Tracking

### 4.1 Sentry Integration

**File:** `services/shared-utils/src/monitoring/sentry.ts`

**Action:** CREATE

**Purpose:** Centralized error tracking

**Content:**
```typescript
/**
 * Sentry Error Tracking
 * 
 * Reference: Runbook 0 Section 24.3
 * 
 * Centralized error tracking for all services.
 */
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export function initializeSentry(serviceName: string) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.DEPLOYMENT_ENV || 'development',
    
    // Service identification
    serverName: serviceName,
    
    // Release tracking
    release: process.env.APP_VERSION || 'unknown',
    
    // Sampling
    tracesSampleRate: 0.1, // 10% of transactions
    profilesSampleRate: 0.1,
    
    // Integrations
    integrations: [
      new ProfilingIntegration()
    ],
    
    // Filter sensitive data
    beforeSend(event) {
      // Remove sensitive fields
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      
      if (event.request?.data) {
        // Redact passwords, tokens, etc.
        const data = JSON.parse(JSON.stringify(event.request.data));
        redactSensitiveFields(data);
        event.request.data = data;
      }
      
      return event;
    }
  });
}

function redactSensitiveFields(obj: any) {
  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'apiKey',
    'api_key',
    'authorization'
  ];
  
  for (const key in obj) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      obj[key] = '[REDACTED]';
    } else if (typeof obj[key] === 'object') {
      redactSensitiveFields(obj[key]);
    }
  }
}

/**
 * Capture exception with context
 */
export function captureException(
  error: Error,
  context?: Record<string, any>
) {
  Sentry.captureException(error, {
    contexts: {
      custom: context
    }
  });
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info'
  });
}
```

---

## Task 5: Incident Response

### 5.1 Incident Response Playbook

**File:** `docs/operations/incident-response.md`

**Action:** CREATE

**Purpose:** Standard operating procedures for incidents

**Content:**
```markdown
# Incident Response Playbook

Standard procedures for handling production incidents.

---

## Severity Levels

**P0 - Critical (Page immediately)**
- Complete service outage
- Data loss
- Security breach
- Affects all users

**P1 - High (Page during business hours)**
- Partial service degradation
- High error rates (>5%)
- Affects significant user subset

**P2 - Medium (No page)**
- Minor feature broken
- Performance degradation
- Affects small user subset

**P3 - Low (No page)**
- Cosmetic issues
- Non-critical features
- Individual user reports

---

## Response Procedures

### P0 - Critical Incident

**Immediate Actions (0-5 minutes):**
1. Acknowledge alert in PagerDuty
2. Join incident Slack channel (#incidents)
3. Assess impact: Check Grafana dashboard
4. Declare incident in Slack: `/incident declare`
5. Page additional on-call if needed

**Investigation (5-15 minutes):**
1. Check recent deployments (last 2 hours)
2. Review error logs in CloudWatch/ELK
3. Check Sentry for new error patterns
4. Verify database connectivity
5. Check service health endpoints

**Mitigation (15-30 minutes):**
1. If caused by recent deployment → Rollback
2. If database issue → Restart connections
3. If resource exhaustion → Scale up pods
4. If external dependency → Enable fallback

**Rollback Procedure:**
```bash
# Kubernetes rollback
kubectl rollout undo deployment/records-service -n factsway-prod

# Verify rollback
kubectl rollout status deployment/records-service -n factsway-prod
```

**Communication:**
- Update status page every 15 minutes
- Post in #incidents channel
- Notify affected customers if outage >30 minutes

---

### Service-Specific Troubleshooting

#### Records Service Down

**Symptoms:**
- Health check failing
- 503 errors from load balancer
- Pods crashing

**Debug:**
```bash
# Check pod status
kubectl get pods -n factsway-prod | grep records

# Check logs
kubectl logs -n factsway-prod deployment/records-service --tail=100

# Check events
kubectl describe deployment records-service -n factsway-prod
```

**Common Causes:**
1. Database connection timeout → Restart PostgreSQL connection pool
2. Out of memory → Increase memory limit
3. Port conflict → Check for zombie processes

---

#### Database Connection Issues

**Symptoms:**
- "Connection pool exhausted" errors
- Slow queries
- Timeouts

**Debug:**
```bash
# Check PostgreSQL
kubectl exec -it postgres-0 -n factsway-prod -- psql -U factsway_prod

# Check active connections
SELECT count(*) FROM pg_stat_activity;

# Check slow queries
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```

**Mitigation:**
1. Increase connection pool size
2. Kill long-running queries
3. Restart services to reset connections

---

#### Export Service Failures

**Symptoms:**
- Export timeouts
- Corrupt DOCX files
- High memory usage

**Debug:**
```bash
# Check service logs
kubectl logs -n factsway-prod deployment/export-service --tail=100

# Check memory usage
kubectl top pods -n factsway-prod | grep export
```

**Common Causes:**
1. Large document (>200 pages) → Increase timeout
2. Memory leak → Restart pod
3. Missing dependencies → Rebuild container

---

## Post-Incident Procedures

### Incident Resolution (Within 24 hours)

1. **Verify Fix:**
   - Monitor for 1 hour post-fix
   - Confirm error rates back to baseline
   - Check no new related alerts

2. **Customer Communication:**
   - Update status page: "Resolved"
   - Post mortem summary
   - Notify affected users

3. **Documentation:**
   - Update incident ticket with timeline
   - Add to incident log spreadsheet
   - Schedule post-mortem meeting

### Post-Mortem (Within 1 week)

**Required Attendees:**
- Incident commander
- On-call engineer
- Engineering manager
- Product manager (for P0/P1)

**Template:**
```markdown
# Post-Mortem: [Incident Title]

**Date:** YYYY-MM-DD
**Duration:** X hours Y minutes
**Severity:** PX
**Incident Commander:** Name

## Summary
Brief description of what happened.

## Impact
- Users affected: X
- Revenue impact: $Y
- Data loss: None/Describe

## Timeline
- HH:MM - Alert fired
- HH:MM - Incident declared
- HH:MM - Root cause identified
- HH:MM - Fix deployed
- HH:MM - Incident resolved

## Root Cause
Technical explanation of what caused the incident.

## Resolution
How was it fixed?

## Action Items
- [ ] Item 1 (Owner: Name, Due: Date)
- [ ] Item 2 (Owner: Name, Due: Date)

## Lessons Learned
What went well? What could be improved?
```

---

## Rollback Procedures

### Kubernetes Rollback

```bash
# List deployment history
kubectl rollout history deployment/records-service -n factsway-prod

# Rollback to previous version
kubectl rollout undo deployment/records-service -n factsway-prod

# Rollback to specific revision
kubectl rollout undo deployment/records-service -n factsway-prod --to-revision=3

# Verify rollback
kubectl rollout status deployment/records-service -n factsway-prod
```

### Database Rollback

```bash
# Check migration history
npm run migrate:status

# Rollback last migration
npm run migrate:down

# Rollback to specific version
npm run migrate:down:to -- --to 20240101000000
```

### Desktop App Rollback

**If auto-update pushed bad version:**

1. Remove bad version from S3:
   ```bash
   aws s3 rm s3://factsway-updates/latest.yml
   aws s3 rm s3://factsway-updates/v1.2.3/
   ```

2. Re-upload previous version as latest:
   ```bash
   aws s3 cp v1.2.2/latest.yml s3://factsway-updates/latest.yml
   ```

3. Invalidate CDN:
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id E1234 \
     --paths "/latest*.yml"
   ```

---

## Contacts

**On-Call Rotation:** See PagerDuty schedule

**Escalation:**
- Level 1: On-call engineer
- Level 2: Engineering manager
- Level 3: CTO

**External Vendors:**
- AWS Support: 1-800-xxx-xxxx (Premium Support)
- Sentry: support@sentry.io
- PagerDuty: support@pagerduty.com
```

---

## Verification

**From Runbook 0 Section 19.15:**

### Verification Checklist

**Auto-Update Server:**
- [ ] CloudFront distribution created
- [ ] S3 bucket configured
- [ ] SSL certificate valid
- [ ] Update manifests generated
- [ ] electron-updater can fetch updates
- [ ] Rollback tested

**Kubernetes Deployment:**
- [ ] All services deployed
- [ ] PostgreSQL running
- [ ] Migrations executed
- [ ] Health checks passing
- [ ] Ingress configured
- [ ] Scaling working (HPA)

**Monitoring:**
- [ ] Prometheus scraping metrics
- [ ] Grafana dashboards showing data
- [ ] Alerts firing in test
- [ ] PagerDuty integration working
- [ ] Logs flowing to CloudWatch/ELK
- [ ] Sentry capturing errors

**Incident Response:**
- [ ] Playbook documented
- [ ] On-call rotation configured
- [ ] Escalation paths defined
- [ ] Rollback procedures tested
- [ ] Post-mortem template created
- [ ] Communication templates ready

---

## Success Criteria

✅ Auto-update server operational
✅ Kubernetes deployment automated
✅ Monitoring dashboards created
✅ Alerting rules configured
✅ Error tracking integrated
✅ Incident response documented
✅ Rollback procedures tested
✅ Production ready for launch

---

## 🎉 FINAL MILESTONE: Complete Specification

**All 15 Runbooks Complete!**

With Runbook 15 finished, the entire FACTSWAY specification is complete:
- ✅ Runbooks 0-10: Desktop implementation stack
- ✅ Runbooks 11-12: Testing infrastructure
- ✅ Runbook 13: User documentation
- ✅ Runbook 14: CI/CD automation
- ✅ Runbook 15: Production operations

**What's Buildable:**
A complete, production-ready legal document drafting platform with:
- Desktop application for all platforms
- Automated testing (E2E + integration)
- Continuous delivery pipeline
- Production monitoring & alerting
- Comprehensive documentation

**Next Phase:** Implementation (execute Runbooks 1-15 with Claude Code)

---

## Reference

**Runbook 0 Sections:**
- Section 22: Deployment Models
- Section 24: Operations & Monitoring

**Dependencies:**
- Runbooks 1-14: Complete application with CI/CD

**External Tools:**
- Kubernetes: https://kubernetes.io
- Prometheus: https://prometheus.io
- Grafana: https://grafana.com
- Sentry: https://sentry.io

---

**End of Runbook 15**
**End of FACTSWAY Specification (Runbooks 0-15)**
