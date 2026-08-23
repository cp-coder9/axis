import type { CalculatorDefinition, FormulaOutput } from './registry';
import type { Dimension, InputField, Quantity, UnitCode, ValidationIssue } from './types';

function field(
  key: string,
  label: string,
  unit: UnitCode,
  dimension: Dimension,
  value: number,
  min = 0,
  max = Number.MAX_VALUE,
): InputField {
  return Object.freeze({
    key, label, dimension, canonicalUnit: unit, allowedUnits: Object.freeze([unit]),
    defaultValue: Object.freeze({ value, unit }), min: Object.freeze({ value: min, unit }), max: Object.freeze({ value: max, unit }),
  });
}

function q(inputs: Readonly<Record<string, Quantity>>, key: string): number {
  return inputs[key].value;
}

function issue(fieldName: string, message: string): ValidationIssue[] {
  return [{ field: fieldName, code: 'formula-domain', message }];
}

const structuralReference = (id: string, title: string, clause: string | null = null) => [{
  id, title, edition: 'unverified-advisory', clause, url: null,
}];

const steelBeam: CalculatorDefinition = Object.freeze({
  id: 'steel-beam',
  title: 'Steel Beam Bending & Deflection',
  icon: 'eng_steel',
  formulaVersion: 'steel-beam/1.0.0',
  fields: Object.freeze([
    field('span_m', 'Beam span', 'm', 'length', 6),
    field('udl_kN_m', 'Uniform line load', 'kN/m', 'line-load', 12),
    field('fy_MPa', 'Yield strength fy', 'MPa', 'pressure', 355),
    field('sectionZx_mm3', 'Section modulus Zx (mm3)', '1', 'dimensionless', 900_000),
    field('secondMoment_mm4', 'Second moment I (mm4)', '1', 'dimensionless', 54_000_000),
    field('allow_deflect', 'Allowable deflection', 'mm', 'length', 20),
  ]),
  calculate(inputs: Readonly<Record<string, Quantity>>): FormulaOutput | ValidationIssue[] {
    const spanMm = q(inputs, 'span_m') * 1000;
    const lineLoadNPerMm = q(inputs, 'udl_kN_m');
    const fy = q(inputs, 'fy_MPa');
    const zx = q(inputs, 'sectionZx_mm3');
    const secondMoment = q(inputs, 'secondMoment_mm4');
    if (spanMm <= 0 || fy <= 0 || zx <= 0 || secondMoment <= 0) return issue('formula', 'Steel geometry and material values must be greater than zero.');
    const momentKNm = lineLoadNPerMm * spanMm ** 2 / 8 / 1e6;
    const capacityKNm = fy * zx / 1e6;
    const deflectionMm = 5 * lineLoadNPerMm * spanMm ** 4 / (384 * 200_000 * secondMoment);
    const utilization = momentKNm / capacityKNm * 100;
    return {
      results: [
        { key: 'moment', label: 'Bending moment', quantity: { value: momentKNm, unit: 'kN' }, passes: null, criterion: 'M = wL^2/8; displayed as kN.m' },
        { key: 'capacity', label: 'Design moment capacity', quantity: { value: capacityKNm, unit: 'kN' }, passes: null, criterion: 'Md = fyZ/10^6; displayed as kN.m' },
        { key: 'utilization', label: 'Bending utilisation', quantity: { value: utilization, unit: '%' }, passes: utilization <= 100, criterion: '<= 100%' },
        { key: 'deflection', label: 'Deflection', quantity: { value: deflectionMm, unit: 'mm' }, passes: deflectionMm <= q(inputs, 'allow_deflect'), criterion: `<= ${q(inputs, 'allow_deflect')} mm` },
      ],
      derivation: ['M = wL^2/8 in N and mm', 'Md = fyZ/10^6', 'delta = 5wL^4/(384EI)'],
      references: structuralReference('sans-10162-1', 'SANS 10162-1', '13.5'),
      assumptions: ['Simply supported beam with a uniformly distributed service load.', 'Elastic modulus E = 200000 MPa.'],
      limitations: ['Shear, lateral stability, detailing, connections, and load combinations are omitted.', 'Contained pending independent professional approval.'],
    };
  },
});

const concreteBeam: CalculatorDefinition = Object.freeze({
  id: 'concrete-beam', title: 'Reinforced Concrete Beam Flexure', icon: 'eng_concrete', formulaVersion: 'concrete-beam/1.0.0',
  fields: Object.freeze([
    field('b_mm', 'Beam width b', 'mm', 'length', 300), field('d_mm', 'Effective depth d', 'mm', 'length', 550),
    field('fcu_MPa', 'Concrete strength fcu', 'MPa', 'pressure', 30), field('fy_MPa', 'Steel strength fy', 'MPa', 'pressure', 450),
    field('M_kNm', 'Applied moment (kN.m)', 'kN', 'force', 180),
  ]),
  calculate(inputs: Readonly<Record<string, Quantity>>): FormulaOutput | ValidationIssue[] {
    const b = q(inputs, 'b_mm'); const d = q(inputs, 'd_mm'); const fcu = q(inputs, 'fcu_MPa');
    const fy = q(inputs, 'fy_MPa'); const momentKNm = q(inputs, 'M_kNm');
    if (b <= 0 || d <= 0 || fcu <= 0 || fy <= 0 || momentKNm < 0) return issue('M_kNm', 'Concrete formula inputs are outside the positive physical domain.');
    const k = momentKNm * 1e6 / (b * d ** 2 * fcu);
    if (k < 0 || k > 0.225) return issue('M_kNm', `Concrete K=${k.toFixed(6)} is outside the supported 0 to 0.225 domain.`);
    const radicand = 0.25 - k / 0.9;
    if (radicand < 0) return issue('M_kNm', 'Concrete lever-arm square-root domain is negative.');
    const z = Math.min(0.95 * d, d * (0.5 + Math.sqrt(radicand)));
    const steelArea = momentKNm * 1e6 / (0.87 * fy * z);
    return {
      results: [
        { key: 'k-factor', label: 'Dimensionless K factor', quantity: { value: k, unit: '1' }, passes: k <= 0.156, criterion: 'Advisory K <= 0.156' },
        { key: 'lever-arm', label: 'Lever arm z', quantity: { value: z, unit: 'mm' }, passes: null, criterion: 'z <= 0.95d' },
        { key: 'steel-area', label: 'Required reinforcement area', quantity: { value: steelArea, unit: 'mm2' }, passes: null, criterion: 'As = M/(0.87 fy z)' },
      ],
      derivation: ['K = M_Nmm/(b_mm d_mm^2 fcu_N/mm2)', 'z = min(0.95d, d(0.5 + sqrt(0.25 - K/0.9)))', 'As = M/(0.87 fy z)'],
      references: structuralReference('sans-10100-1', 'SANS 10100-1', '3.3.4'),
      assumptions: ['Rectangular singly reinforced section.'],
      limitations: ['Shear, stability, detailing, doubly reinforced design, and load combinations are omitted.', 'Contained pending independent professional approval.'],
    };
  },
});

const timberBeam: CalculatorDefinition = Object.freeze({
  id: 'timber-beam', title: 'Timber Beam Bending', icon: 'eng_timber', formulaVersion: 'timber-beam/1.0.0',
  fields: Object.freeze([
    field('span_m', 'Beam span', 'm', 'length', 4), field('udl_kN_m', 'Uniform line load', 'kN/m', 'line-load', 2.5),
    field('b_mm', 'Width b', 'mm', 'length', 75), field('h_mm', 'Depth h', 'mm', 'length', 225),
    field('fb_MPa', 'Allowable bending stress', 'MPa', 'pressure', 12),
  ]),
  calculate(inputs: Readonly<Record<string, Quantity>>): FormulaOutput | ValidationIssue[] {
    const span = q(inputs, 'span_m'); const load = q(inputs, 'udl_kN_m'); const b = q(inputs, 'b_mm'); const h = q(inputs, 'h_mm'); const allowable = q(inputs, 'fb_MPa');
    if (span <= 0 || b <= 0 || h <= 0 || allowable <= 0) return issue('formula', 'Timber geometry and strength must be greater than zero.');
    const moment = load * span ** 2 / 8; const sectionModulus = b * h ** 2 / 6; const stress = moment * 1e6 / sectionModulus;
    return {
      results: [
        { key: 'moment', label: 'Bending moment', quantity: { value: moment, unit: 'kN' }, passes: null, criterion: 'M = wL^2/8; displayed as kN.m' },
        { key: 'section-modulus', label: 'Section modulus (mm3)', quantity: { value: sectionModulus, unit: '1' }, passes: null, criterion: 'S = bh^2/6' },
        { key: 'bending-stress', label: 'Bending stress', quantity: { value: stress, unit: 'MPa' }, passes: stress <= allowable, criterion: `<= ${allowable} MPa` },
      ],
      derivation: ['M = wL^2/8', 'S = bh^2/6', 'fb = M/S'], references: structuralReference('sans-10163-2', 'SANS 10163-2'),
      assumptions: ['Simply supported prismatic member.'], limitations: ['Deflection, lateral stability, bearing, connections, and load combinations are omitted.', 'Contained pending independent professional approval.'],
    };
  },
});

const geoBearing: CalculatorDefinition = Object.freeze({
  id: 'geo-bearing', title: 'Foundation Bearing Pressure', icon: 'eng_geo', formulaVersion: 'geo-bearing/1.0.0',
  fields: Object.freeze([
    field('P_kN', 'Column service load', 'kN', 'force', 850), field('B_m', 'Footing width B', 'm', 'length', 2.2),
    field('L_m', 'Footing length L', 'm', 'length', 2.2), field('q_allow_kPa', 'Allowable bearing pressure', 'kPa', 'pressure', 180),
    field('depth_m', 'Foundation depth D', 'm', 'length', 1.2), field('soil_density_kN_m3', 'Soil unit weight (kN/m3)', '1', 'dimensionless', 18),
  ]),
  calculate(inputs: Readonly<Record<string, Quantity>>): FormulaOutput | ValidationIssue[] {
    const p = q(inputs, 'P_kN'); const b = q(inputs, 'B_m'); const length = q(inputs, 'L_m'); const depth = q(inputs, 'depth_m');
    const gamma = q(inputs, 'soil_density_kN_m3'); const allowable = q(inputs, 'q_allow_kPa');
    if (b <= 0 || length <= 0 || allowable <= 0) return issue('formula', 'Footing dimensions and allowable pressure must be greater than zero.');
    const area = b * length; const pressure = p / area + gamma * depth; const utilization = pressure / allowable * 100;
    return {
      results: [
        { key: 'footing-area', label: 'Footing area', quantity: { value: area, unit: 'm2' }, passes: null, criterion: 'A = B L' },
        { key: 'gross-service-bearing', label: 'Gross service bearing pressure', quantity: { value: pressure, unit: 'kPa' }, passes: pressure <= allowable, criterion: `<= ${allowable} kPa` },
        { key: 'utilization', label: 'Bearing utilisation', quantity: { value: utilization, unit: '%' }, passes: utilization <= 100, criterion: '<= 100%' },
      ],
      derivation: ['A = B L', 'q_gross,service = P/(B L) + gamma D'], references: structuralReference('sans-10160-5', 'SANS 10160-5'),
      assumptions: ['Concentric service load and uniform contact pressure.'], limitations: ['Settlement, differential settlement, eccentricity, groundwater, and geotechnical investigation results are omitted.', 'Contained pending independent professional approval.'],
    };
  },
});

export const STRUCTURAL_DEFINITIONS = Object.freeze({
  'steel-beam': steelBeam,
  'concrete-beam': concreteBeam,
  'timber-beam': timberBeam,
  'geo-bearing': geoBearing,
} satisfies Partial<Record<CalculatorDefinition['id'], CalculatorDefinition>>);
