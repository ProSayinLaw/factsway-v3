#!/bin/bash
# Drift Detection Script
# Run this periodically during implementation to catch architectural drift

cd /Users/alexcruz/Documents/factsway-backend

echo "=== DRIFT DETECTION REPORT ==="
echo "Generated: $(date)"
echo ""

# Check 1: No duplicate ingestion code
echo "## Check 1: Duplicate Ingestion Detection"
echo ""

if [ -d "factsway-ingestion" ] && [ -d "services/ingestion-service" ]; then
  echo "⚠️ WARNING: Both old and new ingestion exist!"
  echo "   Old: factsway-ingestion/"
  echo "   New: services/ingestion-service/"
  echo "   Action: Verify migration complete, delete old"
else
  echo "✅ PASS: No duplicate ingestion code"
fi
echo ""

# Check 2: Services use environment variables (not hardcoded URLs)
echo "## Check 2: Service Discovery Pattern"
echo ""

if [ -d "services" ]; then
  hardcoded=$(grep -r "http://localhost:[0-9]" services --include="*.ts" --include="*.py" 2>/dev/null | grep -v "process.env" | wc -l | tr -d ' ')

  if [ "$hardcoded" -gt 0 ]; then
    echo "❌ FAIL: Found $hardcoded hardcoded localhost URLs"
    grep -rn "http://localhost:[0-9]" services --include="*.ts" --include="*.py" 2>/dev/null | grep -v "process.env" | head -5
    echo "   Action: Replace with process.env.SERVICE_NAME_URL"
  else
    echo "✅ PASS: All service URLs use environment variables"
  fi
else
  echo "ℹ️ INFO: No services directory yet"
fi
echo ""

# Check 3: No direct database access from API routes
echo "## Check 3: API Routes Use Services (Not Direct DB)"
echo ""

if [ -d "src/api/routes" ]; then
  direct_db=$(grep -r "db\.\|database\." src/api/routes --include="*.ts" 2>/dev/null | grep -v "// " | wc -l | tr -d ' ')

  if [ "$direct_db" -gt 3 ]; then
    echo "⚠️ WARNING: Found $direct_db potential direct DB accesses in API routes"
    echo "   Expected: API routes call services, services access DB"
    echo "   Action: Verify these are service calls, not direct DB"
  else
    echo "✅ PASS: API routes appear to use services"
  fi
else
  echo "ℹ️ INFO: No API routes directory found"
fi
echo ""

# Check 4: Desktop orchestrator exists if services exist
echo "## Check 4: Orchestrator Implementation Status"
echo ""

if [ -d "services" ]; then
  service_count=$(find services -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')

  if [ ! -f "apps/desktop/src/main/orchestrator.ts" ] && [ ! -f "src/main/orchestrator.ts" ]; then
    echo "❌ FAIL: Services exist but no orchestrator found!"
    echo "   Services: $service_count"
    echo "   Action: Create DesktopOrchestrator (Runbook 7)"
  else
    echo "✅ PASS: Orchestrator exists"
  fi
else
  echo "ℹ️ INFO: No services yet, orchestrator not needed"
fi
echo ""

# Check 5: IPC channels not broken
echo "## Check 5: IPC Channel Integrity"
echo ""

if [ -d "src/main" ]; then
  registered=$(grep -r "ipcMain.handle" src/main --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
  invoked=$(grep -r "invokeChannel" src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')

  echo "   Registered handlers: $registered"
  echo "   Invocations: $invoked"

  if [ "$invoked" -gt "$registered" ]; then
    echo "⚠️ WARNING: More invocations than handlers (possible missing handlers)"
  else
    echo "✅ PASS: Channel invocations <= registered handlers"
  fi
else
  echo "ℹ️ INFO: No src/main directory found"
fi
echo ""

# Check 6: Monorepo structure (if supposed to be created)
echo "## Check 6: Monorepo Structure Check"
echo ""

if [ -f "lerna.json" ] || [ -f "pnpm-workspace.yaml" ]; then
  if [ ! -d "services" ]; then
    echo "⚠️ WARNING: Monorepo config exists but no services/ directory"
  elif [ ! -d "apps" ]; then
    echo "⚠️ WARNING: Monorepo config exists but no apps/ directory"
  else
    echo "✅ PASS: Monorepo structure looks correct"
  fi
else
  echo "ℹ️ INFO: Not yet using monorepo structure"
fi
echo ""

echo "=== END DRIFT DETECTION ==="
echo ""
echo "Run this script periodically during implementation to catch drift early"
