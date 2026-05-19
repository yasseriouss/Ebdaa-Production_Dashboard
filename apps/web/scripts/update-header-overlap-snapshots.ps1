# Regenerate Playwright PNG baselines for e2e/headerOverlap.spec.ts (requires Chromium).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $root

if (-not (Test-Path "apps/web/dist/index.html")) {
  Write-Host "Building web (dist/)..."
  pnpm --filter web run build
}

$env:CI = "true"
$env:PLAYWRIGHT_USE_PREVIEW = "1"
Push-Location apps/web
try {
  pnpm exec playwright install chromium
  pnpm exec playwright test e2e/headerOverlap.spec.ts --update-snapshots
} finally {
  Pop-Location
}

Write-Host "Snapshots written to apps/web/e2e/headerOverlap.spec.ts-snapshots/"
