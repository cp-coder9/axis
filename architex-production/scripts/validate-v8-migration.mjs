import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'e2e', 'fixtures', 'v8-migration-manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('P6-INV-01: migration manifest missing');
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const expectedCounts = [13, 10, 7, 8, 9];
const canonical = Object.keys(JSON.parse(fs.readFileSync(path.join(root, '..', 'tools.json'), 'utf8')));
const ids = manifest.waves.flatMap((wave, index) => {
  if (wave.modules.length !== expectedCounts[index]) throw new Error(`P6-INV-01: wave ${index + 1} must contain ${expectedCounts[index]} modules`);
  return wave.modules.map((module) => {
    if (!fs.existsSync(path.join(root, module.componentFile))) throw new Error(`P6-INV-01: ${module.id} component file missing`);
    return module.id;
  });
});
if (new Set(ids).size !== ids.length) throw new Error('P6-INV-01: duplicate module ID across migration waves');
if (ids.length !== 47 || canonical.length !== 47 || ids.some((id) => !canonical.includes(id)) || canonical.some((id) => !ids.includes(id))) throw new Error('P6-INV-01: migration wave union does not match canonical 47-module registry');
console.log('P6-INV-01: 47/47 migration inventory is valid.');
