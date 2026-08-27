import { createHash } from 'node:crypto';
import { access, mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULT_REFERENCE = 'E:/Downloads/architex_datum_os_integrated_modules_v8_engineering_godmode.html';
const DEFAULT_OUTPUT = 'generated/godmode-reference.json';
const DEFAULT_SHELL_OUTPUT = 'generated/godmode-shell-contract.json';
const DEFAULT_SPECFORGE_OUTPUT = 'generated/specforge-reference-contract.json';

export const referencePath = () => resolve(process.env.ARCHITEX_GODMODE_REFERENCE ?? DEFAULT_REFERENCE);

function extractBalancedAssignment(html, marker) {
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Reference assignment not found: ${marker}`);
  let start = markerIndex + marker.length;
  while (/\s/.test(html[start] ?? '')) start += 1;
  if (html[start] !== '{') throw new Error(`Reference assignment is not an object: ${marker}`);

  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = start; index < html.length; index += 1) {
    const character = html[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === '{') depth += 1;
    if (character === '}') {
      depth -= 1;
      if (depth === 0) return html.slice(start, index + 1);
    }
  }
  throw new Error(`Unterminated reference assignment: ${marker}`);
}

function parseLiteral(source) {
  let index = 0;
  const skip = () => { while (/\s/.test(source[index] ?? '')) index += 1; };
  const parseString = () => {
    const quote = source[index++];
    let value = '';
    while (index < source.length) {
      const character = source[index++];
      if (character === quote) return value;
      if (character !== '\\') { value += character; continue; }
      const escaped = source[index++];
      const escapes = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v', '0': '\0' };
      value += escapes[escaped] ?? escaped;
    }
    throw new Error('Unterminated string in reference literal');
  };
  const parseIdentifier = () => {
    const start = index;
    while (/[A-Za-z0-9_$-]/.test(source[index] ?? '')) index += 1;
    if (start === index) throw new Error(`Expected identifier at reference offset ${index}`);
    return source.slice(start, index);
  };
  const parseValue = () => {
    skip();
    const character = source[index];
    if (character === "'" || character === '"') return parseString();
    if (character === '{') {
      index += 1;
      const object = {};
      skip();
      while (source[index] !== '}') {
        const key = source[index] === "'" || source[index] === '"' ? parseString() : parseIdentifier();
        skip();
        if (source[index++] !== ':') throw new Error(`Expected colon after ${key}`);
        object[key] = parseValue();
        skip();
        if (source[index] === ',') { index += 1; skip(); continue; }
        if (source[index] !== '}') throw new Error(`Expected comma or closing brace after ${key}`);
      }
      index += 1;
      return object;
    }
    if (character === '[') {
      index += 1;
      const array = [];
      skip();
      while (source[index] !== ']') {
        array.push(parseValue());
        skip();
        if (source[index] === ',') { index += 1; skip(); continue; }
        if (source[index] !== ']') throw new Error(`Expected comma or closing bracket at reference offset ${index}`);
      }
      index += 1;
      return array;
    }
    if (/[0-9-]/.test(character ?? '')) {
      const start = index;
      while (/[0-9.eE+-]/.test(source[index] ?? '')) index += 1;
      const number = Number(source.slice(start, index));
      if (!Number.isFinite(number)) throw new Error(`Invalid number at reference offset ${start}`);
      return number;
    }
    const identifier = parseIdentifier();
    if (identifier === 'true') return true;
    if (identifier === 'false') return false;
    if (identifier === 'null') return null;
    throw new Error(`Executable reference literal is not allowed: ${identifier}`);
  };
  const value = parseValue();
  skip();
  if (index !== source.length) throw new Error(`Unexpected reference literal content at offset ${index}`);
  return value;
}

function normalizeTool(id, value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`Invalid tool record: ${id}`);
  const tabs = Array.isArray(value.tabs) ? value.tabs.map((tab) => ({ ...tab })) : [];
  return {
    id,
    name: String(value.name ?? ''),
    icon: String(value.icon ?? ''),
    tone: String(value.tone ?? ''),
    group: String(value.group ?? ''),
    stage: String(value.stage ?? ''),
    summary: String(value.summary ?? ''),
    status: value.status === 'scaffold' ? 'scaffold' : 'live',
    source: String(value.source ?? ''),
    tabs,
  };
}

function assertReferenceShape(tools) {
  const ids = Object.keys(tools);
  if (ids.length !== 47 || new Set(ids).size !== 47) throw new Error(`Expected 47 unique reference tools, received ${ids.length}`);
  if (!tools.specforge || !Array.isArray(tools.specforge.tabs) || tools.specforge.tabs.length !== 14) {
    throw new Error('Reference SpecForge must define 14 tabs');
  }
}

function unresolvedMapToolIds(tools, maps) {
  return [...new Set(
    maps.flatMap((map) => Object.values(map).flat()).filter((toolId) => !tools[toolId]),
  )].sort();
}

export function extractGodModeReference(html) {
  const tools = JSON.parse(extractBalancedAssignment(html, 'const TOOLS='));
  tools.meetings = parseLiteral(extractBalancedAssignment(html, 'TOOLS.meetings='));
  tools.engineering_calc = parseLiteral(extractBalancedAssignment(html, 'TOOLS.engineering_calc='));
  const roleToolMap = parseLiteral(extractBalancedAssignment(html, 'const V8_ROLE_ACCESS='));
  const stageToolMap = parseLiteral(extractBalancedAssignment(html, 'const V8_STAGE_MAP='));
  assertReferenceShape(tools);
  return {
    schemaVersion: 1,
    sourcePath: referencePath().replaceAll('\\', '/'),
    sourceSha256: createHash('sha256').update(html).digest('hex'),
    tools: Object.fromEntries(Object.entries(tools).map(([id, tool]) => [id, normalizeTool(id, tool)])),
    stageToolMap,
    roleToolMap,
    unresolvedMapToolIds: unresolvedMapToolIds(tools, [stageToolMap, roleToolMap]),
  };
}

function embeddedSpecForgeSource(html) {
  const sources = JSON.parse(extractBalancedAssignment(html, 'const SOURCES='));
  if (typeof sources.specforge !== 'string' || !sources.specforge) {
    throw new Error('Reference SOURCES.specforge payload is missing');
  }
  const decoded = Buffer.from(sources.specforge, 'base64').toString('utf8');
  if (!decoded.includes('function renderCurrentView')) {
    throw new Error('Decoded SpecForge source does not contain its view dispatcher');
  }
  return decoded;
}

function specForgeRendererMap(source) {
  const match = source.match(/function renderCurrentView\(v\)\s*\{\s*const map=\{([^}]*)\}/);
  if (!match) throw new Error('SpecForge view renderer map is missing');
  return Object.fromEntries(match[1].split(',').map((entry) => {
    const pair = entry.trim().match(/^([a-z][a-z0-9]*):([A-Za-z][A-Za-z0-9]*)$/);
    if (!pair) throw new Error(`Invalid SpecForge renderer entry: ${entry}`);
    return [pair[1], pair[2]];
  }));
}

function specForgeProcurementPipeline(source) {
  const match = source.match(/function renderProcurement\(\)\s*\{[\s\S]*?const cols=(\[[^;]+\]);/);
  if (!match) throw new Error('SpecForge procurement pipeline is missing');
  const columns = parseLiteral(match[1]);
  if (!Array.isArray(columns) || columns.some((column) => typeof column !== 'string')) {
    throw new Error('Invalid SpecForge procurement pipeline');
  }
  return columns;
}

export function extractSpecForgeReferenceContract(html) {
  const reference = extractGodModeReference(html);
  const source = embeddedSpecForgeSource(html);
  const renderers = specForgeRendererMap(source);
  const tabs = reference.tools.specforge.tabs;
  const views = tabs.map((tab) => {
    const id = String(tab.arg ?? tab.id ?? '');
    const renderer = renderers[id];
    if (!renderer) throw new Error(`SpecForge tab ${id} has no renderer`);
    if (!new RegExp(`function\\s+${renderer}\\s*\\(`).test(source)) {
      throw new Error(`SpecForge renderer ${renderer} is not defined`);
    }
    return {
      id,
      label: String(tab.label ?? ''),
      renderer,
      icon: String(tab.icon ?? ''),
    };
  });
  if (views.length !== 14 || Object.keys(renderers).length !== 14) {
    throw new Error(`Expected 14 SpecForge views, received ${views.length}`);
  }
  return {
    schemaVersion: 1,
    sourcePath: reference.sourcePath,
    sourceSha256: reference.sourceSha256,
    embeddedSourceSha256: createHash('sha256').update(source).digest('hex'),
    views,
    procurementPipeline: specForgeProcurementPipeline(source),
  };
}

function styleText(html) {
  return [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1]).join('\n');
}

function customProperties(css, selectorPattern) {
  const tokens = {};
  for (const match of css.matchAll(new RegExp(`${selectorPattern}\\s*\\{([^}]*)\\}`, 'gi'))) {
    for (const declaration of match[1].matchAll(/(--[\w-]+)\s*:\s*([^;}]*)/g)) {
      tokens[declaration[1]] = declaration[2].trim();
    }
  }
  return tokens;
}

function withoutMediaRules(css) {
  let result = '';
  let cursor = 0;
  while (true) {
    const start = css.indexOf('@media', cursor);
    if (start < 0) return result + css.slice(cursor);
    result += css.slice(cursor, start);
    const opening = css.indexOf('{', start);
    if (opening < 0) throw new Error('Unterminated reference media rule');
    let depth = 1;
    let index = opening + 1;
    while (index < css.length && depth > 0) {
      if (css[index] === '{') depth += 1;
      if (css[index] === '}') depth -= 1;
      index += 1;
    }
    if (depth !== 0) throw new Error('Unterminated reference media block');
    cursor = index;
  }
}

function mediaRules(css) {
  const rules = [];
  const marker = /@media\s*\(\s*max-width\s*:\s*(\d+)px\s*\)\s*\{/g;
  for (let match = marker.exec(css); match; match = marker.exec(css)) {
    let depth = 1;
    let index = marker.lastIndex;
    while (index < css.length && depth > 0) {
      if (css[index] === '{') depth += 1;
      if (css[index] === '}') depth -= 1;
      index += 1;
    }
    if (depth !== 0) throw new Error('Unterminated reference media block');
    rules.push({ width: Number(match[1]), body: css.slice(marker.lastIndex, index - 1) });
    marker.lastIndex = index;
  }
  return rules;
}

function finalCustomProperty(css, selector, property) {
  let value;
  for (const match of css.matchAll(new RegExp(`${selector.replaceAll('.', '\\.')}\\s*\\{([^}]*)\\}`, 'g'))) {
    const declaration = match[1].match(new RegExp(`${property}\s*:\s*([^;}]*)`));
    if (declaration) value = declaration[1].trim();
  }
  if (!value) throw new Error(`Missing shell property ${property} for ${selector}`);
  return value;
}

const pixels = (value, name) => {
  const match = value.match(/^(\d+)px$/);
  if (!match) throw new Error(`Expected pixel shell value for ${name}, received ${value}`);
  return Number(match[1]);
};

export function extractGodModeShellContract(html) {
  const css = styleText(html);
  const baseCss = withoutMediaRules(css);
  const light = customProperties(baseCss, ':root');
  const dark = {
    ...customProperties(baseCss, String.raw`\[data-theme=['"]dark['"]\]`),
    ...customProperties(baseCss, String.raw`\.dark`),
  };
  const regionPatterns = {
    rail: /<aside\s+class="os-rail"/g,
    navigator: /<aside\s+class="navigator"/g,
    topbar: /<header\s+class="topbar"/g,
    canvas: /<main\s+class="main"/g,
    inspector: /<aside\s+class="inspector"/g,
  };
  const regions = Object.entries(regionPatterns).map(([name, pattern]) => {
    const matches = [...html.matchAll(pattern)];
    if (matches.length !== 1) throw new Error(`Expected one reference shell region ${name}, received ${matches.length}`);
    return [name, matches[0].index];
  }).sort((left, right) => left[1] - right[1]).map(([name]) => name);
  const breakpoints = [...new Set(mediaRules(css)
    .filter(({ body }) => /(?:\.app|\.navigator|\.topbar|\.main|\.inspector|--rail|--nav|--inspector|--top)/.test(body))
    .map(({ width }) => width))].sort((left, right) => left - right);

  return {
    schemaVersion: 1,
    sourcePath: referencePath().replaceAll('\\', '/'),
    sourceSha256: createHash('sha256').update(html).digest('hex'),
    referenceToolCount: 47,
    regionOrder: regions,
    regionSelectors: {
      rail: '.os-rail',
      navigator: '.navigator',
      topbar: '.topbar',
      canvas: '.main',
      inspector: '.inspector',
    },
    geometry: {
      rail: pixels(light['--rail'], '--rail'),
      railExpanded: pixels(finalCustomProperty(css, '.app.rail-expanded', '--rail'), '.app.rail-expanded --rail'),
      navigator: pixels(light['--nav'], '--nav'),
      navigatorCompact: pixels(finalCustomProperty(css, '.app.nav-compact', '--nav'), '.app.nav-compact --nav'),
      inspector: pixels(light['--inspector'], '--inspector'),
      topbar: pixels(light['--top'], '--top'),
    },
    breakpoints,
    themes: { light, dark },
    referenceDarkTheme: Object.keys(dark).length > 0,
  };
}

export const serializeGodModeReference = (reference) => `${JSON.stringify(reference, null, 2)}\n`;
export const serializeGodModeShellContract = (contract) => `${JSON.stringify(contract, null, 2)}\n`;
export const serializeSpecForgeReferenceContract = (contract) => `${JSON.stringify(contract, null, 2)}\n`;

async function writeAtomic(targetPath, bytes) {
  const target = resolve(targetPath);
  const temporary = `${target}.tmp`;
  await mkdir(dirname(target), { recursive: true });
  await writeFile(temporary, bytes, 'utf8');
  await rename(temporary, target);
  return target;
}

export async function writeGodModeReference(outputPath = DEFAULT_OUTPUT) {
  const html = await readFile(referencePath(), 'utf8');
  const bytes = serializeGodModeReference(extractGodModeReference(html));
  const target = await writeAtomic(outputPath, bytes);
  return { target, bytes };
}

export async function writeGodModeShellContract(outputPath = DEFAULT_SHELL_OUTPUT) {
  const html = await readFile(referencePath(), 'utf8');
  const bytes = serializeGodModeShellContract(extractGodModeShellContract(html));
  const target = await writeAtomic(outputPath, bytes);
  return { target, bytes };
}

export async function writeSpecForgeReferenceContract(outputPath = DEFAULT_SPECFORGE_OUTPUT) {
  const html = await readFile(referencePath(), 'utf8');
  const bytes = serializeSpecForgeReferenceContract(extractSpecForgeReferenceContract(html));
  const target = await writeAtomic(outputPath, bytes);
  return { target, bytes };
}

async function checkGodModeReference(outputPath = DEFAULT_OUTPUT) {
  const target = resolve(outputPath);
  const html = await readFile(referencePath(), 'utf8');
  const expected = serializeGodModeReference(extractGodModeReference(html));
  let actual;
  try {
    await access(target);
    actual = await readFile(target, 'utf8');
  } catch {
    throw new Error(`Generated reference is missing: ${target}`);
  }
  if (actual !== expected) throw new Error(`Generated reference is stale: ${target}`);
  return target;
}

async function checkGodModeShellContract(outputPath = DEFAULT_SHELL_OUTPUT) {
  const target = resolve(outputPath);
  const html = await readFile(referencePath(), 'utf8');
  const expected = serializeGodModeShellContract(extractGodModeShellContract(html));
  let actual;
  try {
    await access(target);
    actual = await readFile(target, 'utf8');
  } catch {
    throw new Error(`Generated shell contract is missing: ${target}`);
  }
  if (actual !== expected) throw new Error(`Generated shell contract is stale: ${target}`);
  return target;
}

async function checkSpecForgeReferenceContract(outputPath = DEFAULT_SPECFORGE_OUTPUT) {
  const target = resolve(outputPath);
  const html = await readFile(referencePath(), 'utf8');
  const expected = serializeSpecForgeReferenceContract(extractSpecForgeReferenceContract(html));
  let actual;
  try {
    await access(target);
    actual = await readFile(target, 'utf8');
  } catch {
    throw new Error(`Generated SpecForge contract is missing: ${target}`);
  }
  if (actual !== expected) throw new Error(`Generated SpecForge contract is stale: ${target}`);
  return target;
}

async function main() {
  const check = process.argv.includes('--check');
  const outputArgument = process.argv.find((argument) => argument.startsWith('--output='));
  const outputPath = outputArgument ? outputArgument.slice('--output='.length) : DEFAULT_OUTPUT;
  const shellOutputArgument = process.argv.find((argument) => argument.startsWith('--shell-output='));
  const shellOutputPath = shellOutputArgument ? shellOutputArgument.slice('--shell-output='.length) : DEFAULT_SHELL_OUTPUT;
  const specForgeOutputArgument = process.argv.find((argument) => argument.startsWith('--specforge-output='));
  const specForgeOutputPath = specForgeOutputArgument ? specForgeOutputArgument.slice('--specforge-output='.length) : DEFAULT_SPECFORGE_OUTPUT;
  if (check) {
    const target = await checkGodModeReference(outputPath);
    const shellTarget = await checkGodModeShellContract(shellOutputPath);
    const specForgeTarget = await checkSpecForgeReferenceContract(specForgeOutputPath);
    console.log(`God Mode reference is current: ${target}`);
    console.log(`God Mode shell contract is current: ${shellTarget}`);
    console.log(`SpecForge reference contract is current: ${specForgeTarget}`);
    return;
  }
  const { target } = await writeGodModeReference(outputPath);
  const { target: shellTarget } = await writeGodModeShellContract(shellOutputPath);
  const { target: specForgeTarget } = await writeSpecForgeReferenceContract(specForgeOutputPath);
  console.log(`Generated God Mode reference: ${target}`);
  console.log(`Generated God Mode shell contract: ${shellTarget}`);
  console.log(`Generated SpecForge reference contract: ${specForgeTarget}`);
}

const isMain = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  main().catch(async (error) => {
    const outputArgument = process.argv.find((argument) => argument.startsWith('--output='));
    const outputPath = resolve(outputArgument ? outputArgument.slice('--output='.length) : DEFAULT_OUTPUT);
    const shellOutputArgument = process.argv.find((argument) => argument.startsWith('--shell-output='));
    const shellOutputPath = resolve(shellOutputArgument ? shellOutputArgument.slice('--shell-output='.length) : DEFAULT_SHELL_OUTPUT);
    const specForgeOutputArgument = process.argv.find((argument) => argument.startsWith('--specforge-output='));
    const specForgeOutputPath = resolve(specForgeOutputArgument ? specForgeOutputArgument.slice('--specforge-output='.length) : DEFAULT_SPECFORGE_OUTPUT);
    await unlink(`${outputPath}.tmp`).catch(() => undefined);
    await unlink(`${shellOutputPath}.tmp`).catch(() => undefined);
    await unlink(`${specForgeOutputPath}.tmp`).catch(() => undefined);
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
