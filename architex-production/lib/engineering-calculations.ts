/**
 * Legacy import path retained for source compatibility.
 * The canonical calculator registry and formulas live in lib/calculations.
 */
export { CALC_REGISTRY } from './calculations/registry';
export { defaultInputs, runCalculation } from './calculations/core';
export type {
  CalculatorId,
  CalculationRun,
  InputField as CalcField,
  Quantity,
} from './calculations/types';
export type CalcInputs = Record<string, import('./calculations/types').Quantity>;
