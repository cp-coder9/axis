import { createHash } from 'node:crypto';
import { access, mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULT_REFERENCE = 'E:/Downloads/architex_datum_os_integrated_modules_v8_engineering_godmode.html';
const DEFAULT_OUTPUT = 'generated/godmode-reference.json';

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

export const serializeGodModeReference = (reference) => `${JSON.stringify(reference, null, 2)}\n`;

export async function writeGodModeReference(outputPath = DEFAULT_OUTPUT) {
  const target = resolve(outputPath);
  const temporary = `${target}.tmp`;
  const html = await readFile(referencePath(), 'utf8');
  const bytes = serializeGodModeReference(extractGodModeReference(html));
  await mkdir(dirname(target), { recursive: true });
  await writeFile(temporary, bytes, 'utf8');
  await rename(temporary, target);
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

async function main() {
  const check = process.argv.includes('--check');
  const outputArgument = process.argv.find((argument) => argument.startsWith('--output='));
  const outputPath = outputArgument ? outputArgument.slice('--output='.length) : DEFAULT_OUTPUT;
  if (check) {
    const target = await checkGodModeReference(outputPath);
    console.log(`God Mode reference is current: ${target}`);
    return;
  }
  const { target } = await writeGodModeReference(outputPath);
  console.log(`Generated God Mode reference: ${target}`);
}

const isMain = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  main().catch(async (error) => {
    const outputArgument = process.argv.find((argument) => argument.startsWith('--output='));
    const outputPath = resolve(outputArgument ? outputArgument.slice('--output='.length) : DEFAULT_OUTPUT);
    await unlink(`${outputPath}.tmp`).catch(() => undefined);
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
