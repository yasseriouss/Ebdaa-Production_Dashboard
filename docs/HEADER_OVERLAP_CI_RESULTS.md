# Header-Overlap Visual Regression & CI Results

This document summarizes the enhancements made to the visual regression testing pipeline for the Factory Data Hub web application.

## 1. Decoupled Test Configuration
**File:** `apps/web/e2e/headerOverlap.config.ts`

Previously, test scenarios were hardcoded within the spec file. They are now centralized in a TypeScript configuration file, allowing for easy management of:
- **Routes**: Target pages for overlap checks.
- **Viewports**: Resolution settings (Desktop vs. Mobile).
- **Sidebar State**: Forcing expanded or collapsed states.
- **Precision**: Per-scenario `maxDiffPixelRatio` overrides.

## 2. Data-Driven Test Suite
**File:** `apps/web/e2e/headerOverlap.spec.ts`

The spec file has been refactored to iterate over the `overlapScenarios` defined in the config. Key improvements include:
- **Matrix Matching**: Uses Playwright's unnamed screenshot logic to automatically append project name (e.g., `chromium`) and platform (e.g., `linux`) to baseline filenames.
- **Dynamic Assertions**: Automatically determines if a sidebar check is applicable based on viewport width.

## 3. Matrix-Aware Baseline Checker
**File:** `apps/web/scripts/check-header-overlap-baselines.mjs`

A custom Node.js script that ensures CI never runs against missing baselines:
- **Project Discovery**: Lists Playwright projects dynamically to match the CI matrix exactly.
- **Stem Calculation**: Predictive logic to determine the exact PNG filenames Playwright expects.
- **Missing Stem Report**: If baselines are missing, it generates `apps/web/missing-baselines.txt` for diagnostic uploads.

## 4. Enhanced CI Pipeline & Diagnostics
**File:** `.github/workflows/web.yml`

The CI workflow now includes a robust diagnostic suite for E2E failures:
- **Background Servers**: Both the API server and Web preview server are started in background mode.
- **Log Capture**: All server output is piped to `.log` files (`dev-server.log` and `api-server.log`).
- **Failure Artifacts**: On any failure, the following are automatically uploaded:
  - `dev-server.log`
  - `api-server.log`
  - `missing-baselines.txt` (if baseline check failed)
  - Playwright HTML reports and trace files.

## 5. Maintenance Commands

- **Local Snapshot Update**:
  ```powershell
  pnpm --filter web run test:e2e:update-header-overlap
  ```
- **CI Manual Update**: Trigger the "Update E2E snapshots" workflow via the GitHub Actions UI.
