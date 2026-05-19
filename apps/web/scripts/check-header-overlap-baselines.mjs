#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');
const snapshotsDir = path.join(webRoot, 'e2e', 'headerOverlap.spec.ts-snapshots');

console.log('Checking header-overlap baselines...');

let jsonOutput;
try {
  jsonOutput = execSync('pnpm exec playwright test e2e/headerOverlap.spec.ts --list --reporter=json', {
    cwd: webRoot,
    encoding: 'utf-8',
    env: { ...process.env, PLAYWRIGHT_SKIP_WEBSERVER: '1' }
  });
} catch (e) {
  console.error('Failed to list playwright tests:', e.message);
  process.exit(1);
}

const report = JSON.parse(jsonOutput);
const missingStems = [];
const platform = process.platform; // win32, linux, darwin

function walkSuites(suites, projectName) {
  for (const suite of suites) {
    if (suite.specs) {
      for (const spec of suite.specs) {
        // Playwright default unnamed screenshot naming:
        // {suiteTitle slugified}-{specTitle slugified}-{ordinal}-{projectName}-{platform}.png
        // Our template: {arg}-{projectName}-{platform}.png
        // Where {arg} is {suiteTitle slugified}-{specTitle slugified}-{ordinal}

        const suiteTitleSlug = suite.title.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').toLowerCase();
        const specTitleSlug = spec.title.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').toLowerCase();
        
        const baseStem = `${suiteTitleSlug}-${specTitleSlug}`;
        
        // desktop scenarios have 2 screenshots (header, sidebar), mobile has 1 (header)
        const isDesktop = !spec.title.includes('mobile');
        const count = isDesktop ? 2 : 1;

        for (let i = 1; i <= count; i++) {
          const stem = `${baseStem}-${i}`;
          const filename = `${stem}-${projectName}-${platform}.png`;
          const fullPath = path.join(snapshotsDir, filename);

          if (!existsSync(fullPath)) {
            missingStems.push(stem);
            console.log(`❌ Missing: ${filename}`);
          } else {
            console.log(`✅ Found: ${filename}`);
          }
        }
      }
    }
    if (suite.suites) {
      walkSuites(suite.suites, projectName);
    }
  }
}

// The JSON report might have multiple projects
for (const project of report.config.projects) {
  // Filter suites by project if needed, but --list --reporter=json usually gives suites for all projects
  // We need to find the suites that belong to this project.
  // Actually, suites[0].suites[0].specs[0].tests contains projectId.
  
  // Let's just walk the whole tree for each project and only check tests matching the project ID.
  walkSuites(report.suites, project.name);
}

if (missingStems.length > 0) {
  const uniqueStems = [...new Set(missingStems)];
  writeFileSync(path.join(webRoot, 'missing-baselines.txt'), uniqueStems.join('\n'));
  console.log(`\nFound ${uniqueStems.length} missing snapshot stems. List written to missing-baselines.txt`);
  process.exit(1);
}

console.log('\nAll baselines found!');
process.exit(0);
