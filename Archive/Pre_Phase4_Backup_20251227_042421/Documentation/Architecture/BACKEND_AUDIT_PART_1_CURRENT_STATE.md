# BACKEND ARCHITECTURE AUDIT - Part 1: Current State Deep Scan

**Repository:** factsway-backend  
**Purpose:** Map EVERY component of current backend to prevent drift during Runbook implementation  
**Output:** Complete architectural inventory with classification and dependency mapping

---

## CRITICAL CONTEXT

**What STAYS (Core Backend - DO NOT TOUCH):**
- Electron main process (`src/main/`)
- IPC handler system (`src/main/handlers/`)
- API routes (`src/api/routes/`)
- Database schema (`migrations/`)
- Storage services (`src/main/services/`)
- UI integration points

**What GOES (Old Ingestion Pipeline - TO BE REMOVED):**
- `factsway-ingestion/` Python pipeline (except adapters/connectors)
- Any TypeScript code that duplicates Python ingestion
- Legacy ULDM processing code (if any remains)

**What GETS ADDED (New Microservices - PER RUNBOOK 0):**
- 8 new service directories (records, ingestion, export, etc.)
- Service discovery configuration
- Desktop orchestrator
- Child process management

---

## Part 1A: File System Deep Scan

### Output File: `/tmp/backend-current-architecture.md`

```bash
#!/bin/bash
cd /path/to/factsway-backend

OUTPUT="/tmp/backend-current-architecture.md"

cat > "$OUTPUT" << 'HEADER'
# FACTSWAY Backend - Current Architecture Map
**Generated:** $(date)
**Purpose:** Complete inventory for drift prevention

---

## 1. Directory Structure (Complete Tree)

HEADER

echo "## 1. Directory Structure" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Complete tree excluding noise
tree -L 4 -I 'node_modules|.git|dist|build|.pytest_cache|__pycache__|*.pyc' \
  --dirsfirst -F >> "$OUTPUT"

echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Count files by type
cat >> "$OUTPUT" << 'COUNTS'
## 2. File Count by Type

COUNTS

echo "" >> "$OUTPUT"
echo "### TypeScript/JavaScript Files" >> "$OUTPUT"
find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | wc -l >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "### Python Files" >> "$OUTPUT"
find factsway-ingestion -name "*.py" 2>/dev/null | wc -l >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "### Configuration Files" >> "$OUTPUT"
find . -maxdepth 2 -name "*.json" -o -name "*.yaml" -o -name "*.yml" | wc -l >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "### Documentation Files" >> "$OUTPUT"
find docs -name "*.md" 2>/dev/null | wc -l >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "Scan complete: $OUTPUT"
```

---

## Part 1B: Component Classification

### Output File: `/tmp/backend-component-classification.md`

```bash
#!/bin/bash
cd /path/to/factsway-backend

OUTPUT="/tmp/backend-component-classification.md"

cat > "$OUTPUT" << 'HEADER'
# Component Classification Matrix

**Legend:**
- 🟢 KEEP - Core backend, do not modify
- 🔴 REMOVE - Old ingestion pipeline, delete during cleanup
- 🟡 REFACTOR - Needs updates for new architecture
- 🔵 NEW - To be created per Runbook 0

---

HEADER

# Function to classify files
classify_component() {
  local path=$1
  local component=$2
  local purpose=$3
  local fate=$4
  
  echo "| \`$path\` | $component | $purpose | $fate |" >> "$OUTPUT"
}

echo "## TypeScript Core Components" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "| Path | Component | Purpose | Fate |" >> "$OUTPUT"
echo "|------|-----------|---------|------|" >> "$OUTPUT"

# Classify src/main/ components
if [ -d "src/main" ]; then
  for file in src/main/*.ts; do
    [ -f "$file" ] || continue
    filename=$(basename "$file")
    case "$filename" in
      index.ts)
        classify_component "$file" "Electron Main" "App entry point" "🟢 KEEP"
        ;;
      preload.ts)
        classify_component "$file" "Electron Preload" "IPC bridge" "🟢 KEEP"
        ;;
      *)
        classify_component "$file" "Main Process" "$(head -n 5 "$file" | grep -o '//.*' | head -1 || echo 'Unknown')" "🟢 KEEP"
        ;;
    esac
  done
fi

echo "" >> "$OUTPUT"
echo "## IPC Handlers" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "| Path | Handler | Channel | Fate |" >> "$OUTPUT"
echo "|------|---------|---------|------|" >> "$OUTPUT"

# Find all IPC handler files
if [ -d "src/main/handlers" ]; then
  find src/main/handlers -name "*.ts" | while read -r file; do
    # Extract channel names from file
    channels=$(grep -o "ipcMain.handle(['\"][^'\"]*" "$file" | sed "s/ipcMain.handle(['\"]//g" || echo "")
    
    if [ -n "$channels" ]; then
      while IFS= read -r channel; do
        [ -z "$channel" ] && continue
        classify_component "$file" "IPC Handler" "$channel" "🟢 KEEP"
      done <<< "$channels"
    else
      classify_component "$file" "IPC Handler" "Unknown channels" "🟢 KEEP"
    fi
  done
fi

echo "" >> "$OUTPUT"
echo "## API Routes" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "| Path | Route | Method | Fate |" >> "$OUTPUT"
echo "|------|-------|--------|------|" >> "$OUTPUT"

# Find all API route files
if [ -d "src/api/routes" ]; then
  find src/api/routes -name "*.ts" | while read -r file; do
    # Extract route definitions
    routes=$(grep -E "router\.(get|post|put|delete|patch)" "$file" | head -5 || echo "")
    
    if [ -n "$routes" ]; then
      filename=$(basename "$file" .ts)
      classify_component "$file" "API Route" "/$filename/*" "🟢 KEEP"
    fi
  done
fi

echo "" >> "$OUTPUT"
echo "## Python Ingestion Pipeline" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "| Path | Component | Purpose | Fate |" >> "$OUTPUT"
echo "|------|-----------|---------|------|" >> "$OUTPUT"

# Classify Python files
if [ -d "factsway-ingestion" ]; then
  # Main pipeline files
  if [ -f "factsway-ingestion/ingestion_engine/docx/pipeline_v2/pipeline.py" ]; then
    classify_component "factsway-ingestion/ingestion_engine/docx/pipeline_v2/pipeline.py" "Python Pipeline" "DOCX ingestion (OLD)" "🔴 REMOVE"
  fi
  
  if [ -f "factsway-ingestion/ingestion_engine/docx/pipeline_v2/extended_pipeline.py" ]; then
    classify_component "factsway-ingestion/ingestion_engine/docx/pipeline_v2/extended_pipeline.py" "Python Pipeline" "Extended pipeline (OLD)" "🔴 REMOVE"
  fi
  
  # Services that might be reusable
  if [ -d "factsway-ingestion/ingestion_engine/services" ]; then
    find factsway-ingestion/ingestion_engine/services -name "*.py" | while read -r file; do
      classify_component "$file" "Python Service" "NLP/Citation service" "🟡 REFACTOR - Extract for new microservices"
    done
  fi
  
  # API adapters (might connect to new services)
  if [ -f "factsway-ingestion/app.py" ]; then
    classify_component "factsway-ingestion/app.py" "Python API" "FastAPI server (OLD)" "🔴 REMOVE"
  fi
fi

echo "" >> "$OUTPUT"
echo "## Database & Storage" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "| Path | Component | Purpose | Fate |" >> "$OUTPUT"
echo "|------|-----------|---------|------|" >> "$OUTPUT"

# Migrations
if [ -d "migrations" ]; then
  migration_count=$(find migrations -name "*.sql" | wc -l | tr -d ' ')
  classify_component "migrations/" "Database Schema" "$migration_count migration files" "🟢 KEEP"
fi

# Storage services
if [ -d "src/main/services" ]; then
  find src/main/services -name "*storage*.ts" -o -name "*db*.ts" | while read -r file; do
    classify_component "$file" "Storage Service" "Data persistence" "🟢 KEEP"
  done
fi

echo "" >> "$OUTPUT"
echo "Classification complete: $OUTPUT"
```

---

## Part 1C: IPC Channel Inventory

### Output File: `/tmp/backend-ipc-channels.md`

```bash
#!/bin/bash
cd /path/to/factsway-backend

OUTPUT="/tmp/backend-ipc-channels.md"

cat > "$OUTPUT" << 'HEADER'
# IPC Channel Complete Inventory

**Purpose:** Map all IPC channels to prevent breaking UI integration

---

## Registered Channels (ipcMain.handle)

HEADER

echo "| Channel Name | Handler File | Line | Status |" >> "$OUTPUT"
echo "|--------------|--------------|------|--------|" >> "$OUTPUT"

# Find all ipcMain.handle registrations
grep -rn "ipcMain.handle" src/main --include="*.ts" | while IFS=: read -r file line content; do
  # Extract channel name
  channel=$(echo "$content" | grep -o "handle(['\"][^'\"]*" | sed "s/handle(['\"]//g")
  
  if [ -n "$channel" ]; then
    echo "| \`$channel\` | \`$file\` | $line | 🟢 ACTIVE |" >> "$OUTPUT"
  fi
done

echo "" >> "$OUTPUT"
echo "## Invoked Channels (invokeChannel)" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "| Channel Name | Caller File | Line | Target |" >> "$OUTPUT"
echo "|--------------|-------------|------|--------|" >> "$OUTPUT"

# Find all channel invocations
grep -rn "invokeChannel" src --include="*.ts" --include="*.tsx" | while IFS=: read -r file line content; do
  # Extract channel name
  channel=$(echo "$content" | grep -o "invokeChannel(['\"][^'\"]*" | sed "s/invokeChannel(['\"]//g")
  
  if [ -n "$channel" ]; then
    # Try to find handler
    handler=$(grep -l "ipcMain.handle(['\"]$channel" src/main/**/*.ts 2>/dev/null | head -1)
    
    if [ -n "$handler" ]; then
      echo "| \`$channel\` | \`$file\` | $line | ✅ \`$handler\` |" >> "$OUTPUT"
    else
      echo "| \`$channel\` | \`$file\` | $line | ❌ NO HANDLER |" >> "$OUTPUT"
    fi
  fi
done

echo "" >> "$OUTPUT"
echo "## Orphaned Channels (No Invocations)" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "| Channel Name | Handler File | Status |" >> "$OUTPUT"
echo "|--------------|--------------|--------|" >> "$OUTPUT"

# Find registered but never invoked channels
while IFS= read -r channel_line; do
  channel=$(echo "$channel_line" | cut -d'|' -f2 | tr -d ' `')
  
  # Check if invoked anywhere
  invocations=$(grep -r "invokeChannel(['\"]$channel" src --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')
  
  if [ "$invocations" -eq 0 ]; then
    handler=$(echo "$channel_line" | cut -d'|' -f3)
    echo "| \`$channel\` | $handler | 🔴 DEAD CODE |" >> "$OUTPUT"
  fi
done < <(grep "^|" "$OUTPUT" | grep "ipcMain.handle" | tail -n +2)

echo "" >> "$OUTPUT"
echo "IPC inventory complete: $OUTPUT"
```

---

## Part 1D: API Route Inventory

### Output File: `/tmp/backend-api-routes.md`

```bash
#!/bin/bash
cd /path/to/factsway-backend

OUTPUT="/tmp/backend-api-routes.md"

cat > "$OUTPUT" << 'HEADER'
# API Route Complete Inventory

**Purpose:** Map all REST API endpoints

---

## Express Routes

HEADER

echo "| Method | Path | Handler File | Line | Auth Required |" >> "$OUTPUT"
echo "|--------|------|--------------|------|---------------|" >> "$OUTPUT"

# Find all route definitions
if [ -d "src/api/routes" ]; then
  find src/api/routes -name "*.ts" | while read -r file; do
    # Extract route definitions with method and path
    grep -n "router\.\(get\|post\|put\|delete\|patch\)" "$file" | while IFS=: read -r line content; do
      method=$(echo "$content" | grep -o "router\.\w*" | sed 's/router\.//' | tr '[:lower:]' '[:upper:]')
      path=$(echo "$content" | grep -o "['\"][^'\"]*['\"]" | head -1 | tr -d "'\"")
      
      # Check for auth middleware
      if echo "$content" | grep -q "requireAuth\|isAuthenticated"; then
        auth="🔒 YES"
      else
        auth="🔓 NO"
      fi
      
      echo "| $method | \`$path\` | \`$file\` | $line | $auth |" >> "$OUTPUT"
    done
  done
fi

echo "" >> "$OUTPUT"
echo "## Python FastAPI Routes" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "| Method | Path | File | Status |" >> "$OUTPUT"
echo "|--------|------|------|--------|" >> "$OUTPUT"

# Find Python API routes
if [ -f "factsway-ingestion/app.py" ]; then
  grep -n "@app\.\(get\|post\|put\|delete\)" factsway-ingestion/app.py | while IFS=: read -r line content; do
    method=$(echo "$content" | grep -o "@app\.\w*" | sed 's/@app\.//' | tr '[:lower:]' '[:upper:]')
    path=$(echo "$content" | grep -o "['\"][^'\"]*['\"]" | head -1 | tr -d "'\"")
    
    echo "| $method | \`$path\` | \`app.py\` | 🔴 TO BE REMOVED |" >> "$OUTPUT"
  done
fi

echo "" >> "$OUTPUT"
echo "API route inventory complete: $OUTPUT"
```

---

## Part 1E: Dependency Graph

### Output File: `/tmp/backend-dependencies.md`

```bash
#!/bin/bash
cd /path/to/factsway-backend

OUTPUT="/tmp/backend-dependencies.md"

cat > "$OUTPUT" << 'HEADER'
# Backend Dependency Graph

**Purpose:** Map import relationships to prevent breaking changes

---

## TypeScript Dependencies

HEADER

# Create dependency map
echo "### Most Imported Files (Hub Files)" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "| File | Import Count | Risk Level |" >> "$OUTPUT"
echo "|------|--------------|------------|" >> "$OUTPUT"

# Find most imported files
find src -name "*.ts" -o -name "*.tsx" | while read -r file; do
  rel_path=${file#src/}
  import_count=$(grep -r "from ['\"].*${rel_path%.*}" src --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')
  
  if [ "$import_count" -gt 5 ]; then
    if [ "$import_count" -gt 20 ]; then
      risk="🔴 HIGH - Critical Hub"
    elif [ "$import_count" -gt 10 ]; then
      risk="🟡 MEDIUM - Important"
    else
      risk="🟢 LOW"
    fi
    
    echo "| \`$file\` | $import_count | $risk |" >> "$OUTPUT"
  fi
done | sort -t'|' -k3 -nr >> "$OUTPUT"

echo "" >> "$OUTPUT"
echo "### External Dependencies (package.json)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

if [ -f "package.json" ]; then
  echo "\`\`\`json" >> "$OUTPUT"
  jq '.dependencies' package.json >> "$OUTPUT"
  echo "\`\`\`" >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"
echo "### Python Dependencies (requirements.txt)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

if [ -f "factsway-ingestion/requirements.txt" ]; then
  echo "\`\`\`" >> "$OUTPUT"
  cat factsway-ingestion/requirements.txt >> "$OUTPUT"
  echo "\`\`\`" >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"
echo "Dependency graph complete: $OUTPUT"
```

---

## Execution Instructions

**Run all parts in order:**

```bash
# Part 1A: File system scan
bash /path/to/part-1a-scan.sh

# Part 1B: Component classification  
bash /path/to/part-1b-classification.sh

# Part 1C: IPC channel inventory
bash /path/to/part-1c-ipc-channels.sh

# Part 1D: API route inventory
bash /path/to/part-1d-api-routes.sh

# Part 1E: Dependency graph
bash /path/to/part-1e-dependencies.sh

# Combine all outputs
cat /tmp/backend-current-architecture.md \
    /tmp/backend-component-classification.md \
    /tmp/backend-ipc-channels.md \
    /tmp/backend-api-routes.md \
    /tmp/backend-dependencies.md \
    > /tmp/BACKEND_CURRENT_STATE_COMPLETE.md

echo "✅ Current state mapping complete!"
echo "📄 Output: /tmp/BACKEND_CURRENT_STATE_COMPLETE.md"
```

---

## Expected Outputs

After running Part 1, you will have:

1. **Complete directory tree** - Visual structure of entire backend
2. **Component classification matrix** - Every file tagged KEEP/REMOVE/REFACTOR/NEW
3. **IPC channel inventory** - All channels mapped with status (active/orphaned/dead)
4. **API route inventory** - All REST endpoints documented
5. **Dependency graph** - Critical hub files identified

**File size estimate:** ~500-1000 lines of organized architecture documentation

**Next:** Part 2 will map Runbook 0's target architecture and create comparison matrices.

---

## Notes for Claude Code Executor

- These scripts use standard bash/grep/find commands
- Replace `/path/to/factsway-backend` with actual path
- Scripts are safe (read-only, no modifications)
- Output goes to `/tmp/` (won't pollute repo)
- Each part is independent but builds on previous
- If a command fails, skip it and note in output
