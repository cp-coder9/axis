export const CALCULATOR_IDS = [
  'steel-beam', 'concrete-beam', 'timber-beam', 'geo-bearing',
  'wind-load', 'stormwater-rational', 'duct-sizing', 'heat-gain',
  'travel-distance', 'fire-resistance', 'fire-water', 'cable-sizing',
  'max-demand', 'cold-water', 'drainage-fu', 'geyser-sizing', 'unit-converter',
] as const;

export type CalculatorId = typeof CALCULATOR_IDS[number];
export type EngineeringCalculationSchemaVersion = 'engineering-calculation/v1';

export type Dimension =
  | 'dimensionless' | 'length' | 'area' | 'volume' | 'force'
  | 'line-load' | 'pressure' | 'velocity' | 'flow' | 'power'
  | 'energy' | 'temperature-difference' | 'current' | 'voltage'
  | 'resistance-per-length' | 'time';

export type UnitCode =
  | 'm' | 'mm' | 'm2' | 'mm2' | 'ha' | 'm3' | 'L'
  | 'kN' | 'N' | 'kN/m' | 'N/mm' | 'Pa' | 'kPa' | 'MPa'
  | 'm/s' | 'L/s' | 'L/min' | 'm3/s' | 'W' | 'kW' | 'kWh'
  | 'K' | 'A' | 'V' | 'mOhm/m' | 'min' | '%' | 'FU' | '1';

export interface Quantity<U extends UnitCode = UnitCode> {
  value: number;
  unit: U;
}

export interface InputField {
  key: string;
  label: string;
  dimension: Dimension;
  canonicalUnit: UnitCode;
  allowedUnits: readonly UnitCode[];
  defaultValue: Quantity;
  min: Quantity;
  max: Quantity;
  integer?: boolean;
}

export interface ValidationIssue {
  field: string;
  code: 'required' | 'not-finite' | 'out-of-range' | 'wrong-unit'
    | 'wrong-dimension' | 'not-integer' | 'unsupported-option' | 'formula-domain';
  message: string;
}

export interface CalculationResultDto {
  key: string;
  label: string;
  quantity: Quantity;
  passes: boolean | null;
  criterion: string | null;
}

export interface StandardReferenceDto {
  id: string;
  title: string;
  edition: string;
  clause: string | null;
  url: string | null;
}

export interface EngineeringCalculationPayloadV1 {
  schemaVersion: EngineeringCalculationSchemaVersion;
  calculatorId: CalculatorId;
  formulaVersion: string;
  inputs: Record<string, Quantity>;
  results: CalculationResultDto[];
  derivation: string[];
  references: StandardReferenceDto[];
  assumptions: string[];
  limitations: string[];
}

export type CalculationRun =
  | { ok: true; payload: EngineeringCalculationPayloadV1 }
  | { ok: false; issues: ValidationIssue[] };
