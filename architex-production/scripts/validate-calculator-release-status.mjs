import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve('.');
const manifestPath = resolve(root, 'config/calculator-release-manifest.json');
const fixturesRoot = resolve(root, 'test/fixtures/calculations');
const expectedIds = ['steel-beam','concrete-beam','timber-beam','geo-bearing','wind-load','stormwater-rational','duct-sizing','heat-gain','travel-distance','fire-resistance','fire-water','cable-sizing','max-demand','cold-water','drainage-fu','geyser-sizing','unit-converter'];
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const findings = [];
const calculators = Array.isArray(manifest.calculators) ? manifest.calculators : [];
const ids = calculators.map((entry) => entry.id);
let advisoryFixtureCases = 0;

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
  try {
    const fixture = JSON.parse(readFileSync(resolve(fixturesRoot, `${entry.id}.json`), 'utf8'));
    const cases = Array.isArray(fixture?.cases) ? fixture.cases : [];
    advisoryFixtureCases += cases.length;
    if (fixture?.calculatorId !== entry.id) findings.push(`${prefix}-FIXTURE-ID|observed=${fixture?.calculatorId ?? 'missing'}`);
    if (cases.length < entry.minimumGoldenCases) findings.push(`${prefix}-FIXTURE-MINIMUM|expected=${entry.minimumGoldenCases}|observed=${cases.length}`);
    const expectedVersion = entry.releaseState === 'validated' ? entry.formulaVersion : `${entry.id}/1.0.0`;
    if (cases.some((testCase) => testCase?.formulaVersion !== expectedVersion)) findings.push(`${prefix}-FIXTURE-VERSION|expected=${expectedVersion}`);
    if (entry.releaseState === 'contained' && cases.some((testCase) => testCase?.classification !== 'advisory-contained')) findings.push(`${prefix}-FIXTURE-CLASSIFICATION|expected=advisory-contained`);
  } catch {
    findings.push(`${prefix}-FIXTURE-READ|observed=missing-or-invalid`);
  }
}
if (advisoryFixtureCases !== 57) findings.push(`P8-CALC-FIXTURE-TOTAL|expected=57|observed=${advisoryFixtureCases}`);
try { execFileSync(process.execPath, ['scripts/generate-calculator-release.mjs', '--check'], { cwd: root, stdio: 'pipe' }); } catch { findings.push('P8-CALC-GENERATED-ARTIFACTS|observed=stale'); }
for (const finding of findings) console.error(finding);
console.log(`Calculator release status: ${calculators.length} checked, ${calculators.length - findings.length} resolved, ${findings.length} blockers`);
if (findings.length) process.exitCode = 1;
