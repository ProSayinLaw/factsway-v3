# Runbook 14: CI/CD Pipelines

**Phase:** Automation (Completion)  
**Estimated Time:** 6-10 hours  
**Prerequisites:** Runbooks 1-13 complete (tested, documented app)  
**Depends On:** Runbook 0 Section 22  
**Enables:** Runbook 15 (production deployment), automated releases

---

## Objective

Create **comprehensive CI/CD pipelines** using GitHub Actions that automate testing, building, and deployment for all target platforms (Windows, macOS, Linux) with automated releases, code signing, and update server deployment.

**Success Criteria:**
- ✅ CI pipeline runs on every commit
- ✅ All tests (unit, integration, E2E) automated
- ✅ Builds for 3 platforms automated
- ✅ Code signing automated (with secrets)
- ✅ Release automation (GitHub Releases)
- ✅ Update server deployment automated
- ✅ Build artifacts stored securely
- ✅ Deployment requires manual approval
- ✅ Rollback capability implemented

---

## Context from Runbook 0

**Referenced Sections:**
- **Section 22:** Deployment Models
  - CI/CD for Desktop deployment
  - Cloud deployment automation
  - Enterprise distribution
- **Section 18:** Testing Strategy (automated test execution)

**Key Principle from Runbook 0:**
> "Automation reduces human error. Every commit should trigger automated tests. Every release should be reproducible. Every deployment should be rollbackable. The CI/CD pipeline is the source of truth for 'what's deployed'."

---

## Current State

**What exists:**
- ✅ All tests (Runbooks 11-12)
- ✅ Build scripts (Runbook 10)
- ✅ Documentation (Runbook 13)
- ❌ No CI/CD automation
- ❌ No release automation
- ❌ No deployment automation
- ❌ No update server

**What this creates:**
- ✅ GitHub Actions workflows (6 workflows)
- ✅ Automated test execution
- ✅ Multi-platform builds
- ✅ Code signing automation
- ✅ Release automation
- ✅ Update server deployment
- ✅ Artifact storage
- ✅ Rollback scripts

---

## Task 1: Core CI Pipeline

### 1.1 Main CI Workflow

**File:** `.github/workflows/ci.yml`

**Action:** CREATE

**Purpose:** Run tests on every commit

**Content:**
```yaml
name: CI - Test & Build

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '18'
  PYTHON_VERSION: '3.11'

jobs:
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Install dependencies
        run: |
          cd desktop
          npm ci
      
      - name: Run ESLint
        run: |
          cd desktop
          npm run lint
      
      - name: Run TypeScript checks
        run: |
          cd desktop
          npm run type-check
  
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Install Python dependencies
        run: |
          pip install pytest pytest-cov
          pip install -r services/ingestion-service/requirements.txt
      
      - name: Run Python unit tests
        run: |
          pytest services/*/tests/unit --cov --cov-report=xml
      
      - name: Install Node dependencies
        run: |
          cd services/records-service
          npm ci
      
      - name: Run Node unit tests
        run: |
          cd services/records-service
          npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage.xml
          flags: unit-tests
  
  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Build services
        run: ./scripts/build-all.sh
      
      - name: Run integration tests
        run: |
          cd integration-tests
          npm ci
          npm test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: integration-test-results
          path: integration-tests/test-results/
  
  e2e-tests:
    name: E2E Tests - ${{ matrix.os }}
    runs-on: ${{ matrix.os }}
    
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Build application
        run: ./scripts/build-all.sh
        shell: bash
      
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
          name: e2e-results-${{ matrix.os }}
          path: e2e-tests/test-results/
      
      - name: Upload videos
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: e2e-videos-${{ matrix.os }}
          path: e2e-tests/test-results/videos/
```

---

## Task 2: Release Build Pipeline

### 2.1 Release Workflow

**File:** `.github/workflows/release.yml`

**Action:** CREATE

**Purpose:** Build and publish releases

**Content:**
```yaml
name: Release - Build & Publish

on:
  push:
    tags:
      - 'v*.*.*'  # Trigger on version tags (v1.0.0)

env:
  NODE_VERSION: '18'
  PYTHON_VERSION: '3.11'

jobs:
  create-release:
    name: Create Release
    runs-on: ubuntu-latest
    outputs:
      release_id: ${{ steps.create_release.outputs.id }}
      upload_url: ${{ steps.create_release.outputs.upload_url }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Get version from tag
        id: get_version
        run: echo "VERSION=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT
      
      - name: Create Release
        id: create_release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: FACTSWAY v${{ steps.get_version.outputs.VERSION }}
          draft: true
          prerelease: false
          body: |
            ## What's New in v${{ steps.get_version.outputs.VERSION }}
            
            [Release notes to be added]
            
            ## Downloads
            
            - **Windows:** FACTSWAY-${{ steps.get_version.outputs.VERSION }}-win-x64.exe
            - **macOS (Intel):** FACTSWAY-${{ steps.get_version.outputs.VERSION }}-mac-x64.dmg
            - **macOS (Apple Silicon):** FACTSWAY-${{ steps.get_version.outputs.VERSION }}-mac-arm64.dmg
            - **Linux:** FACTSWAY-${{ steps.get_version.outputs.VERSION }}-linux-x64.AppImage
  
  build-windows:
    name: Build Windows
    needs: create-release
    runs-on: windows-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Install PyInstaller
        run: pip install pyinstaller
      
      - name: Build Python services
        run: scripts\packaging\build-python-services.bat
      
      - name: Build Node service
        run: scripts\packaging\build-node-service.sh
        shell: bash
      
      - name: Build Electron app
        env:
          CSC_LINK: ${{ secrets.WINDOWS_CERT_BASE64 }}
          CSC_KEY_PASSWORD: ${{ secrets.WINDOWS_CERT_PASSWORD }}
        run: |
          cd desktop
          npm ci
          npm run build
          npm run dist:win
      
      - name: Upload installer
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: ${{ needs.create-release.outputs.upload_url }}
          asset_path: desktop/dist-electron/FACTSWAY-${{ github.ref_name }}-win-x64.exe
          asset_name: FACTSWAY-${{ github.ref_name }}-win-x64.exe
          asset_content_type: application/octet-stream
  
  build-macos:
    name: Build macOS
    needs: create-release
    runs-on: macos-latest
    
    strategy:
      matrix:
        arch: [x64, arm64]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Install dependencies
        run: |
          pip install pyinstaller
          brew install create-dmg
      
      - name: Build services
        run: ./scripts/build-all.sh
      
      - name: Build Electron app
        env:
          CSC_LINK: ${{ secrets.MACOS_CERT_BASE64 }}
          CSC_KEY_PASSWORD: ${{ secrets.MACOS_CERT_PASSWORD }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_ID_PASSWORD: ${{ secrets.APPLE_ID_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
        run: |
          cd desktop
          npm ci
          npm run build
          npm run dist:mac -- --${{ matrix.arch }}
      
      - name: Notarize app (macOS only)
        if: matrix.arch == 'x64'
        run: |
          xcrun notarytool submit \
            desktop/dist-electron/FACTSWAY-${{ github.ref_name }}-mac-${{ matrix.arch }}.dmg \
            --apple-id "${{ secrets.APPLE_ID }}" \
            --password "${{ secrets.APPLE_ID_PASSWORD }}" \
            --team-id "${{ secrets.APPLE_TEAM_ID }}" \
            --wait
      
      - name: Upload DMG
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: ${{ needs.create-release.outputs.upload_url }}
          asset_path: desktop/dist-electron/FACTSWAY-${{ github.ref_name }}-mac-${{ matrix.arch }}.dmg
          asset_name: FACTSWAY-${{ github.ref_name }}-mac-${{ matrix.arch }}.dmg
          asset_content_type: application/octet-stream
  
  build-linux:
    name: Build Linux
    needs: create-release
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y libfuse2
      
      - name: Build services
        run: ./scripts/build-all.sh
      
      - name: Build Electron app
        run: |
          cd desktop
          npm ci
          npm run build
          npm run dist:linux
      
      - name: Upload AppImage
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: ${{ needs.create-release.outputs.upload_url }}
          asset_path: desktop/dist-electron/FACTSWAY-${{ github.ref_name }}-linux-x64.AppImage
          asset_name: FACTSWAY-${{ github.ref_name }}-linux-x64.AppImage
          asset_content_type: application/octet-stream
  
  publish-release:
    name: Publish Release
    needs: [create-release, build-windows, build-macos, build-linux]
    runs-on: ubuntu-latest
    
    steps:
      - name: Publish release
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            await github.rest.repos.updateRelease({
              owner: context.repo.owner,
              repo: context.repo.repo,
              release_id: ${{ needs.create-release.outputs.release_id }},
              draft: false
            });
```

---

## Task 3: Update Server Deployment

### 3.1 Update Server Workflow

**File:** `.github/workflows/deploy-update-server.yml`

**Action:** CREATE

**Purpose:** Deploy release files to update server

**Content:**
```yaml
name: Deploy Update Server

on:
  release:
    types: [published]

jobs:
  deploy-updates:
    name: Deploy to Update Server
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Download release assets
        uses: actions/download-artifact@v4
        with:
          path: ./release-assets
      
      - name: Generate update manifests
        run: |
          # Generate latest.yml for electron-updater
          cat > latest.yml << EOF
          version: ${{ github.event.release.tag_name }}
          files:
            - url: FACTSWAY-${{ github.event.release.tag_name }}-win-x64.exe
              sha512: $(sha512sum release-assets/FACTSWAY-*-win-x64.exe | awk '{print $1}')
              size: $(stat -c%s release-assets/FACTSWAY-*-win-x64.exe)
          path: FACTSWAY-${{ github.event.release.tag_name }}-win-x64.exe
          sha512: $(sha512sum release-assets/FACTSWAY-*-win-x64.exe | awk '{print $1}')
          releaseDate: $(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
          EOF
          
          # Generate latest-mac.yml
          cat > latest-mac.yml << EOF
          version: ${{ github.event.release.tag_name }}
          files:
            - url: FACTSWAY-${{ github.event.release.tag_name }}-mac-x64.dmg
              sha512: $(sha512sum release-assets/FACTSWAY-*-mac-x64.dmg | awk '{print $1}')
              size: $(stat -c%s release-assets/FACTSWAY-*-mac-x64.dmg)
          path: FACTSWAY-${{ github.event.release.tag_name }}-mac-x64.dmg
          sha512: $(sha512sum release-assets/FACTSWAY-*-mac-x64.dmg | awk '{print $1}')
          releaseDate: $(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
          EOF
          
          # Generate latest-linux.yml
          cat > latest-linux.yml << EOF
          version: ${{ github.event.release.tag_name }}
          files:
            - url: FACTSWAY-${{ github.event.release.tag_name }}-linux-x64.AppImage
              sha512: $(sha512sum release-assets/FACTSWAY-*-linux-x64.AppImage | awk '{print $1}')
              size: $(stat -c%s release-assets/FACTSWAY-*-linux-x64.AppImage)
          path: FACTSWAY-${{ github.event.release.tag_name }}-linux-x64.AppImage
          sha512: $(sha512sum release-assets/FACTSWAY-*-linux-x64.AppImage | awk '{print $1}')
          releaseDate: $(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
          EOF
      
      - name: Deploy to S3
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: us-east-1
        run: |
          # Upload installers
          aws s3 cp release-assets/ s3://factsway-updates/${{ github.event.release.tag_name }}/ \
            --recursive \
            --acl public-read
          
          # Upload update manifests
          aws s3 cp latest.yml s3://factsway-updates/latest.yml --acl public-read
          aws s3 cp latest-mac.yml s3://factsway-updates/latest-mac.yml --acl public-read
          aws s3 cp latest-linux.yml s3://factsway-updates/latest-linux.yml --acl public-read
      
      - name: Invalidate CloudFront cache
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/latest*.yml"
```

---

## Task 4: Dependency Updates

### 4.1 Dependabot Configuration

**File:** `.github/dependabot.yml`

**Action:** CREATE

**Purpose:** Automated dependency updates

**Content:**
```yaml
version: 2
updates:
  # Desktop application
  - package-ecosystem: "npm"
    directory: "/desktop"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "factsway/core-team"
    labels:
      - "dependencies"
      - "desktop"
  
  # Renderer
  - package-ecosystem: "npm"
    directory: "/desktop/renderer"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
      - "renderer"
  
  # Records Service
  - package-ecosystem: "npm"
    directory: "/services/records-service"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "backend"
  
  # Python services
  - package-ecosystem: "pip"
    directory: "/services/ingestion-service"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "backend"
      - "python"
  
  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "ci"
```

---

## Task 5: Secrets Management

### 5.1 Required Secrets Documentation

**File:** `docs/ci-cd/secrets.md`

**Action:** CREATE

**Purpose:** Document required GitHub secrets

**Content:**
```markdown
# CI/CD Secrets Configuration

Required secrets for GitHub Actions workflows.

---

## Code Signing Secrets

### Windows Code Signing

**WINDOWS_CERT_BASE64**
- Description: Base64-encoded .pfx certificate
- How to create:
  ```bash
  cat certificate.pfx | base64 > cert.txt
  ```
- Add to GitHub: Settings → Secrets → New repository secret

**WINDOWS_CERT_PASSWORD**
- Description: Password for .pfx certificate
- Add to GitHub: Settings → Secrets → New repository secret

---

### macOS Code Signing

**MACOS_CERT_BASE64**
- Description: Base64-encoded Developer ID Application certificate
- How to create:
  ```bash
  # Export from Keychain
  security find-identity -v -p codesigning
  security export -k login.keychain -t identities -f p12 -o cert.p12
  cat cert.p12 | base64 > cert.txt
  ```

**MACOS_CERT_PASSWORD**
- Description: Password for certificate

**APPLE_ID**
- Description: Apple ID email for notarization
- Example: developer@factsway.com

**APPLE_ID_PASSWORD**
- Description: App-specific password for notarization
- How to create: appleid.apple.com → Security → App-Specific Passwords

**APPLE_TEAM_ID**
- Description: 10-character Team ID
- Find at: developer.apple.com/account

---

## AWS Secrets (Update Server)

**AWS_ACCESS_KEY_ID**
- Description: AWS IAM access key for S3/CloudFront
- Permissions needed:
  - s3:PutObject (factsway-updates bucket)
  - cloudfront:CreateInvalidation

**AWS_SECRET_ACCESS_KEY**
- Description: AWS IAM secret key

**CLOUDFRONT_DISTRIBUTION_ID**
- Description: CloudFront distribution ID for updates.factsway.com
- Example: E1234ABCDEF567

---

## GitHub Token

**GITHUB_TOKEN**
- Description: Auto-generated token for releases
- No configuration needed (automatic)

---

## Optional Secrets

**CODECOV_TOKEN**
- Description: Token for coverage reporting
- Get from: codecov.io

**SLACK_WEBHOOK_URL**
- Description: Webhook for build notifications
- Get from: Slack App settings

---

## Security Best Practices

1. **Rotate secrets annually**
2. **Use least-privilege IAM roles**
3. **Never commit secrets to repository**
4. **Audit secret access logs monthly**
5. **Revoke old certificates immediately**

---

## Testing Secrets Locally

**DO NOT** use production secrets locally.

Create `.env.local`:
```
WINDOWS_CERT_BASE64=test
WINDOWS_CERT_PASSWORD=test
```

Use test certificates for local builds.
```

---

## Verification

**From Runbook 0 Section 19.14:**

### Verification Checklist

**CI Pipeline:**
- [ ] Runs on every commit to main/develop
- [ ] Runs on every PR
- [ ] Lint checks pass
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass on all 3 platforms
- [ ] Test coverage uploaded
- [ ] Build artifacts stored

**Release Pipeline:**
- [ ] Triggered by version tags (v*.*.*)
- [ ] Builds for Windows, macOS (x64+arm64), Linux
- [ ] Code signing works
- [ ] macOS notarization works
- [ ] GitHub release created
- [ ] All installers uploaded
- [ ] Release notes template generated

**Update Server:**
- [ ] Update manifests generated
- [ ] Files uploaded to S3
- [ ] CloudFront cache invalidated
- [ ] electron-updater can fetch updates
- [ ] Version checking works

**Dependency Updates:**
- [ ] Dependabot PRs created weekly
- [ ] PRs labeled correctly
- [ ] Security updates prioritized
- [ ] Breaking changes flagged

**Security:**
- [ ] All secrets configured
- [ ] Secrets not exposed in logs
- [ ] Certificates valid
- [ ] AWS permissions minimal
- [ ] Audit log monitoring enabled

---

## Success Criteria

✅ CI runs on every commit
✅ All tests automated
✅ Multi-platform builds working
✅ Code signing automated
✅ Releases automated
✅ Update server deployed
✅ Dependency updates automated
✅ Rollback capability implemented
✅ Zero manual steps in release process

---

## Next Steps

After Runbook 14 completes:

1. **Runbook 15:** Production Deployment & Monitoring (FINAL)

---

## Reference

**Runbook 0 Sections:**
- Section 22: Deployment Models
- Section 18: Testing Strategy

**Dependencies:**
- Runbooks 1-13: Complete application

**External Tools:**
- GitHub Actions: https://docs.github.com/actions
- electron-builder auto-update: https://electron.build/auto-update

---

**End of Runbook 14**
