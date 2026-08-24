import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve('.');
const manifestPath = resolve(root, 'config/calculator-release-manifest.json');
const expectedIds = ['steel-beam','concrete-beam','timber-beam','geo-bearing','wind-load','stormwater-rational','duct-sizing','heat-gain','travel-distance','fire-resistance','fire-water','cable-sizing','max-demand','cold-water','drainage-fu','geyser-sizing','unit-converter'];
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const findings = [];
const calculators = Array.isArray(manifest.calculators) ? manifest.calculators : [];
const ids = calculators.map((entry) => entry.id);

if (JSON.stringify(ids) !== JSON.stringify(expectedIds)) findings.push('P8-CALC-IDS|expected=17-canonical-ordered|observed=invalid');
for (const entry of calculators) {
  const prefix = `P8-CALC-${entry.id}`;
  if (!['contained', 'validated'].includes(entry.releaseState)) findings.push(`${prefix}-STATE|observed=${entry.releaseState}`);
  if (entry.releaseState === 'contained') {
    if (entry.recordable !== false) findings.push(`${prefix}-CONTAINED-RECORDABLE|observed=${entry.recordable}`);
    if (typeof entry.professionalOwner !== 'string' || !entry.professionalOwner.trim()) findings.push(`${prefix}-CONTAINED-OWNER|observed=missing`);
    if (typeof entry.message !== 'string' || !entry.message.includes('Unvalidated advisory calculation')) findings.push(`${prefix}-CONTAINED-UI|observed=missing-advisory-copy`);
  }
  if (entry.releaseState === 'validated' && (!entry.recordable || !entry.formulaVersion || !Array.isArray(entry.approvalEvidenceIds) || entry.approvalEvidenceIds.length === 0)) findings.push(`${prefix}-VALIDATED-EVIDENCE|observed=incomplete`);
}
try { execFileSync(process.execPath, ['scripts/generate-calculator-release.mjs', '--check'], { cwd: root, stdio: 'pipe' }); } catch { findings.push('P8-CALC-GENERATED-ARTIFACTS|observed=stale'); }
for (const finding of findings) console.error(finding);
console.log(`Calculator release status: ${calculators.length} checked, ${calculators.length - findings.length} resolved, ${findings.length} blockers`);
if (findings.length) process.exitCode = 1;
