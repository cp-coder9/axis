import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const scope = process.argv.find((argument) => argument.startsWith('--scope='))?.slice('--scope='.length)
  ?? process.argv[process.argv.indexOf('--scope') + 1];

if (!['tokens', 'foundations', 'full'].includes(scope)) {
  console.error('Usage: validate-design-system --scope <tokens|foundations|full>');
  process.exit(2);
}

const requirements = {
  tokens: {
    file: 'styles/tokens.css',
    auditId: 'P5-TOK-01',
    selectors: [':root'],
    tokens: [
      '--ax-ref-teal-500', '--ax-ref-teal-700', '--ax-ref-ink-950', '--ax-ref-mint-200', '--ax-ref-mint-100', '--ax-ref-paper-50',
      '--ax-ref-violet-600', '--ax-ref-coral-600', '--ax-ref-amber-700', '--ax-ref-green-700',
      '--ax-canvas', '--ax-surface-1', '--ax-surface-2', '--ax-text', '--ax-text-muted', '--ax-border', '--ax-border-strong',
      '--ax-action-primary', '--ax-action-primary-hover', '--ax-action-secondary', '--ax-focus', '--ax-selection', '--ax-datum',
      '--ax-status-info-fg', '--ax-status-info-bg', '--ax-status-info-border',
      '--ax-status-success-fg', '--ax-status-success-bg', '--ax-status-success-border',
      '--ax-status-warning-fg', '--ax-status-warning-bg', '--ax-status-warning-border',
      '--ax-status-danger-fg', '--ax-status-danger-bg', '--ax-status-danger-border',
      '--ax-status-neutral-fg', '--ax-status-neutral-bg', '--ax-status-neutral-border',
      '--ax-data-1', '--ax-data-2', '--ax-data-3', '--ax-data-4', '--ax-data-5', '--ax-data-6', '--ax-data-7', '--ax-data-8',
    ],
  },
  foundations: {
    file: 'styles/foundations.css',
    auditId: 'P5-A11Y-01',
    selectors: [':focus-visible', '@media (prefers-reduced-motion: reduce)', '@media (forced-colors: active)', '[data-density="comfortable"]', '[data-density="compact"]'],
    tokens: [],
  },
};

function read(relativePath) {
  const target = path.join(root, relativePath);
  if (!fs.existsSync(target)) throw new Error(`${relativePath} is missing`);
  return fs.readFileSync(target, 'utf8');
}

function validate(name) {
  const requirement = requirements[name];
  const css = read(requirement.file);
  const missing = [...requirement.selectors, ...requirement.tokens].filter((value) => !css.includes(value));
  if (missing.length) throw new Error(`${requirement.auditId}: missing ${missing.join(', ')}`);
  if (name === 'tokens') validateTokenContrast(css);
}

function validateTokenContrast(css) {
  const values = new Map();
  for (const [, name, value] of css.matchAll(/(--ax-[\w-]+)\s*:\s*([^;]*);/g)) {
    if (value.trim()) values.set(name, value.trim());
  }
  const resolve = (name) => {
    const value = values.get(name);
    const reference = value?.match(/^var\((--ax-[\w-]+)\)$/)?.[1];
    return reference ? resolve(reference) : value;
  };
  const luminance = (hex) => {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error(`P5-TOK-01: ${hex} is not a supported contrast colour`);
    const channels = hex.slice(1).match(/.{2}/g).map((channel) => parseInt(channel, 16) / 255).map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
  };
  const contrast = (foreground, background) => {
    const [first, second] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (first + 0.05) / (second + 0.05);
  };
  const textPairs = [
    ['--ax-text', '--ax-surface-1'], ['--ax-text', '--ax-surface-2'], ['--ax-action-primary', '--ax-surface-1'],
    ['--ax-status-info-fg', '--ax-status-info-bg'], ['--ax-status-success-fg', '--ax-status-success-bg'],
    ['--ax-status-warning-fg', '--ax-status-warning-bg'], ['--ax-status-danger-fg', '--ax-status-danger-bg'],
    ['--ax-status-neutral-fg', '--ax-status-neutral-bg'],
  ];
  for (const [foreground, background] of textPairs) {
    const ratio = contrast(resolve(foreground), resolve(background));
    if (ratio < 4.5) throw new Error(`P5-TOK-01: ${foreground} on ${background} contrast ${ratio.toFixed(2)}:1 is below 4.5:1`);
  }
  if (!css.includes("[data-theme='dark']")) throw new Error('P5-TOK-01: dark-theme semantic override fixture missing');
}

try {
  if (scope === 'tokens' || scope === 'full') validate('tokens');
  if (scope === 'foundations' || scope === 'full') validate('foundations');
  console.log(`Design-system validation passed (${scope}).`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
