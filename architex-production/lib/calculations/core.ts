import { calculatorDefinition } from './registry';
import { convert, validateQuantity } from './units';
import type {
  CalculatorId,
  CalculationRun,
  EngineeringCalculationPayloadV1,
  Quantity,
  ValidationIssue,
} from './types';

const TAB_TO_CALCULATOR = Object.freeze({
  steel: 'steel-beam', concrete: 'concrete-beam', timber: 'timber-beam', geotechnical: 'geo-bearing',
  wind: 'wind-load', stormwater: 'stormwater-rational', duct: 'duct-sizing', heat: 'heat-gain',
  escape: 'travel-distance', fire_resistance: 'fire-resistance', hydrant: 'fire-water', cable: 'cable-sizing',
  db: 'max-demand', water: 'cold-water', drainage: 'drainage-fu', hotwater: 'geyser-sizing', converter: 'unit-converter',
} satisfies Record<string, CalculatorId>);

function assertFiniteRecord(record: Record<string, { value: number }>, label: string): void {
  for (const [key, quantity] of Object.entries(record)) {
    if (!Number.isFinite(quantity.value)) throw new Error(`${label}.${key} must be finite.`);
  }
}

export function serializeCalculationPayload(
  payload: EngineeringCalculationPayloadV1,
): EngineeringCalculationPayloadV1 {
  if (payload.schemaVersion !== 'engineering-calculation/v1') throw new Error('Unsupported calculation schema version.');
  if (!payload.formulaVersion) throw new Error('Formula version is required.');
  assertFiniteRecord(payload.inputs, 'inputs');
  payload.results.forEach((result, index) => {
    if (!Number.isFinite(result.quantity.value)) throw new Error(`results.${index}.quantity must be finite.`);
  });
  for (const [label, value] of Object.entries({
    derivation: payload.derivation,
    references: payload.references,
    assumptions: payload.assumptions,
    limitations: payload.limitations,
  })) {
    if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
  }
  return payload;
}

export function defaultInputs(id: CalculatorId): Record<string, Quantity> {
  const definition = calculatorDefinition(id);
  if (!definition) throw new Error(`Unsupported calculator: ${id}.`);
  return Object.fromEntries(definition.fields.map((field) => [field.key, { ...field.defaultValue }]));
}

export function calculatorIdForTab(tabKey: string): CalculatorId {
  const id = TAB_TO_CALCULATOR[tabKey as keyof typeof TAB_TO_CALCULATOR];
  if (!id) throw new Error(`Unsupported engineering calculation tab: ${tabKey}.`);
  return id;
}

export function runCalculation(id: string, inputs: Record<string, Quantity>): CalculationRun {
  const definition = calculatorDefinition(id);
  if (!definition) {
    return { ok: false, issues: [{ field: 'calculatorId', code: 'unsupported-option', message: `Unsupported calculator: ${id}.` }] };
  }

  const declaredKeys = new Set(definition.fields.map(({ key }) => key));
  const issues: ValidationIssue[] = Object.keys(inputs)
    .filter((key) => !declaredKeys.has(key))
    .map((key) => ({ field: key, code: 'unsupported-option', message: `Undeclared input field: ${key}.` }));
  const normalized: Record<string, Quantity> = {};
  for (const field of definition.fields) {
    const quantity = inputs[field.key];
    if (!quantity) {
      issues.push({ field: field.key, code: 'required', message: `${field.label} is required.` });
      continue;
    }
    const issue = validateQuantity(quantity, field);
    if (issue) issues.push(issue);
    else normalized[field.key] = convert(quantity, field.canonicalUnit);
  }
  if (issues.length > 0) return { ok: false, issues };

  const output = definition.calculate(normalized);
  if (Array.isArray(output)) return { ok: false, issues: output };
  return {
    ok: true,
    payload: serializeCalculationPayload({
      schemaVersion: 'engineering-calculation/v1',
      calculatorId: definition.id,
      formulaVersion: definition.formulaVersion,
      inputs: normalized,
      ...output,
    }),
  };
}
