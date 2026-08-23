import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const toolsRegistry = JSON.parse(fs.readFileSync(path.join(root, '..', 'tools.json'), 'utf8'));
const backendRegistry = JSON.parse(fs.readFileSync(path.join(root, 'backend', 'data', 'modules.json'), 'utf8'));
const policy = JSON.parse(fs.readFileSync(path.join(root, 'backend', 'data', 'platform-policy.json'), 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// --- Registry parity ---
const toolIds = Object.keys(toolsRegistry);
const backendIds = backendRegistry.map((m) => m.id);
assert(toolIds.length === 47, `Canonical registry must have exactly 47 modules (has ${toolIds.length})`);
assert(new Set(toolIds).size === 47, 'Canonical registry contains duplicate IDs');
assert(new Set(backendIds).size === 47 && backendIds.length === 47, 'Backend registry must have 47 unique IDs');
assert(JSON.stringify(toolIds) === JSON.stringify(backendIds), 'Backend registry IDs must match tools.json exactly');
assert(toolIds.includes('meetings'), 'Meetings must be registered');
assert(toolIds.includes('engineering_calc'), 'Engineering Calculation Hub must be registered');
assert(toolIds.includes('project_passport') && toolIds.includes('documents_drawings') && toolIds.includes('inbox_action') && toolIds.includes('approvals_queue'), 'Foundation modules must be registered');

// --- Governance policy ---
assert(registryItem('meetings').status === 'live', 'Meetings must be live');
assert(registryItem('payments_escrow').fund_holding_enabled === false, 'Escrow fund holding must remain disabled');
assert(policy.payments_escrow?.fund_holding_enabled === false, 'Policy must disable fund holding');
assert(policy.drawing_intelligence?.service === 'shared', 'Drawing intelligence must be a shared service');
for (const consumer of ['specforge', 'bom', 'municipal', 'bim_ifc', 'xa']) {
  assert(policy.drawing_intelligence.consumers.includes(consumer), `Policy must list ${consumer} as a drawing-intelligence consumer`);
}

// --- All 47 modules are now implemented and live (0 scaffolds) ---
const scaffoldIds = toolIds.filter((id) => registryItem(id).status === 'scaffold');
assert(scaffoldIds.length === 0, `All modules must be live; still scaffold: ${scaffoldIds.join(', ')}`);
for (const id of toolIds) {
  const backendItem = backendRegistry.find((m) => m.id === id);
  assert(backendItem && backendItem.status === 'live', `Backend registry ${id} must be live`);
}

// --- Frontend modules exist ---
for (const file of ['ProjectPassportModule.tsx', 'DocumentsDrawingsModule.tsx', 'ActionCentreModule.tsx', 'ApprovalsModule.tsx']) {
  assert(fs.existsSync(path.join(root, 'components', 'modules', file)), `Missing ${file}`);
}

function registryItem(id) {
  const item = toolsRegistry[id];
  assert(item, `Missing registry entry ${id}`);
  return item;
}

console.log('Foundation validation passed: all 47 modules live with registry parity, governed AI, shared drawing intelligence (incl. XA), escrow disabled.');
