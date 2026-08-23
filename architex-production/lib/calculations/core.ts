import type { EngineeringCalculationPayloadV1 } from './types';

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
