import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const requiredEvidence = [
  ['P0', 'docs/v8-remediation/evidence/PHASE_0_RELEASE_EVIDENCE.md'],
  ['P1', 'docs/v8-remediation/evidence/PHASE_1_NAVIGATION_EVIDENCE.md'],
  ['P2', 'docs/v8-remediation/evidence/PHASE_2_CALCULATION_EVIDENCE.md'],
  ['P3', 'docs/v8-remediation/evidence/PHASE_3_PERSISTENCE_SECURITY_EVIDENCE.md'],
  ['P4', 'docs/v8-remediation/evidence/PHASE_4_ENGINEERING_WORKFLOW_EVIDENCE.md'],
  ['P5', 'docs/v8-remediation/evidence/PHASE_5_DESIGN_SYSTEM_EVIDENCE.md'],
  ['P6', 'docs/v8-remediation/evidence/PHASE_6_PRODUCT_THEME_EVIDENCE.md'],
  ['P7', 'docs/v8-remediation/evidence/PHASE_7_GOD_MODE_EVIDENCE.md'],
];

const findings = requiredEvidence.flatMap(([phase, path]) => {
  const absolutePath = resolve(path);
  if (!existsSync(absolutePath)) return [`P8-PHASE-${phase}-EVIDENCE-MISSING|owner=${phase}|evidence=${path}|observed=missing`];
  const status = readFileSync(absolutePath, 'utf8').match(/^Status:\s*`?([^`\r\n]+)`?/m)?.[1]?.trim();
  if (!status || !/^(PASS|APPROVED)/.test(status)) return [`P8-PHASE-${phase}-EVIDENCE-NOT-CERTIFIED|owner=${phase}|evidence=${path}|observed=${status ?? 'missing-status'}`];
  return [];
});

for (const finding of findings) console.error(finding);
console.log(`Phase gates: ${requiredEvidence.length} checked, ${requiredEvidence.length - findings.length} passed, ${findings.length} release blockers`);
if (findings.length) process.exitCode = 1;
