export interface CalcInputs {
  [key: string]: number;
}

export interface CalcResult {
  value: number;
  unit: string;
  passes: boolean | null;
  reference: string;
  label: string;
}

export interface CalcOutput {
  results: CalcResult[];
  derivation: string;
  disclaimers: string[];
}

export interface CalcField {
  key: string;
  label: string;
  unit: string;
  default: number;
  min?: number;
  max?: number;
}

export interface CalcDefinition {
  id: string;
  title: string;
  icon: string;
  standard: string;
  fields: CalcField[];
  calculate: (inputs: CalcInputs) => CalcOutput;
}

/* ── Shared helpers ── */

const PASS = (v: number, limit: number, direction: 'min' | 'max'): boolean | null =>
  direction === 'min' ? v >= limit : v <= limit;

/* ── Structural ── */

export const steelBeam: CalcDefinition = {
  id: 'steel-beam',
  title: 'Steel Beam Bending & Deflection',
  standard: 'SANS 10162-1',
  icon: 'eng_steel',
  fields: [
    { key: 'span_m', label: 'Beam span', unit: 'm', default: 6 },
    { key: 'udl_kN_m', label: 'Uniform load', unit: 'kN/m', default: 12 },
    { key: 'fy_MPa', label: 'Yield strength fy', unit: 'MPa', default: 355 },
    { key: 'sectionZx_mm3', label: 'Section modulus Zx', unit: 'mm³', default: 900000 },
    { key: 'allow_deflect', label: 'Allowable deflection', unit: 'mm', default: 20 },
  ],
  calculate: ({ span_m, udl_kN_m, fy_MPa, sectionZx_mm3, allow_deflect }) => {
    const M = (udl_kN_m * span_m * span_m) / 8;
    const MkNm = M;
    const Md = fy_MPa * (sectionZx_mm3 / 1e6);
    const util = (MkNm / Md) * 100;
    const I = sectionZx_mm3 * 60;
    const delta = (5 * udl_kN_m * span_m ** 4 * 1e12) / (384 * 200000 * I);
    const derivation = `M = wL²/8 = ${udl_kN_m} × ${span_m}² / 8 = ${MkNm.toFixed(1)} kN·m\nMd = fy·Zx = ${fy_MPa} × ${(sectionZx_mm3 / 1e6).toFixed(0)} ×10³ = ${Md.toFixed(0)} kN·m\nUtilisation = ${util.toFixed(1)}% (≤ 100%)\nδ = 5wL⁴/384EI = ${delta.toFixed(1)} mm (≤ ${allow_deflect} mm)`;
    return {
      results: [
        { label: 'Bending moment', value: MkNm, unit: 'kN·m', passes: null, reference: 'SANS 10162-1 §13.5', },
        { label: 'Design capacity Md', value: Md, unit: 'kN·m', passes: null, reference: 'SANS 10162-1 §13.5' },
        { label: 'Bending utilisation', value: util, unit: '%', passes: PASS(util, 100, 'max'), reference: '≤ 100%' },
        { label: 'Deflection δ', value: delta, unit: 'mm', passes: PASS(delta, allow_deflect, 'max'), reference: `≤ ${allow_deflect} mm` },
      ],
      derivation,
      disclaimers: ['Advisory working evidence. Final section selection and capacity checks require professional verification.'],
    };
  },
};

export const concreteBeam: CalcDefinition = {
  id: 'concrete-beam',
  title: 'Reinforced Concrete Beam Flexure',
  standard: 'SANS 10100-1',
  icon: 'eng_concrete',
  fields: [
    { key: 'b_mm', label: 'Beam width b', unit: 'mm', default: 300 },
    { key: 'd_mm', label: 'Effective depth d', unit: 'mm', default: 550 },
    { key: 'fcu_MPa', label: 'Concrete strength fcu', unit: 'MPa', default: 30 },
    { key: 'fy_MPa', label: 'Steel strength fy', unit: 'MPa', default: 450 },
    { key: 'M_kNm', label: 'Applied moment', unit: 'kN·m', default: 180 },
  ],
  calculate: ({ b_mm, d_mm, fcu_MPa, fy_MPa, M_kNm }) => {
    const b = b_mm / 1000;
    const d = d_mm / 1000;
    const K = (M_kNm * 1e6) / (b * d * d * fcu_MPa * 1e6);
    const K_bal = 0.156;
    const z = Math.min(0.95 * d, d * (0.5 + Math.sqrt(0.25 - K / 0.9)));
    const As = (M_kNm * 1e6) / (0.87 * fy_MPa * z * 1000);
    const util = (K / K_bal) * 100;
    const derivation = `K = M/bd²fcu = ${M_kNm}×10⁶ / (${b} × ${d}² × ${fcu_MPa}×10⁶) = ${K.toFixed(4)}\nK_bal = 0.156 → ${util.toFixed(1)}% of balanced limit\nz = d(0.5 + √(0.25 − K/0.9)) = ${(z * 1000).toFixed(0)} mm\nAs = M / 0.87·fy·z = ${As.toFixed(0)} mm²`;
    return {
      results: [
        { label: 'K factor', value: K, unit: '—', passes: PASS(K, K_bal, 'max'), reference: 'SANS 10100-1, K ≤ 0.156' },
        { label: 'Compression ratio', value: util, unit: '%', passes: PASS(util, 100, 'max'), reference: '≤ 100% of K_bal' },
        { label: 'Lever arm z', value: z * 1000, unit: 'mm', passes: null, reference: '0.5d ≤ z ≤ 0.95d' },
        { label: 'Required As', value: As, unit: 'mm²', passes: null, reference: 'SANS 10100-1 §3.3.4' },
      ],
      derivation,
      disclaimers: ['Doubly reinforced design, shear, and detailing checks not included. Professional verification required.'],
    };
  },
};

export const timberBeam: CalcDefinition = {
  id: 'timber-beam',
  title: 'Timber Beam Bending',
  standard: 'SANS 10163-2',
  icon: 'eng_timber',
  fields: [
    { key: 'span_m', label: 'Beam span', unit: 'm', default: 4 },
    { key: 'udl_kN_m', label: 'Uniform load', unit: 'kN/m', default: 2.5 },
    { key: 'b_mm', label: 'Width b', unit: 'mm', default: 75 },
    { key: 'h_mm', label: 'Depth h', unit: 'mm', default: 225 },
    { key: 'fb_MPa', label: 'Allowable bending', unit: 'MPa', default: 12 },
  ],
  calculate: ({ span_m, udl_kN_m, b_mm, h_mm, fb_MPa }) => {
    const M = (udl_kN_m * span_m * span_m) / 8;
    const S = (b_mm * h_mm * h_mm) / 6;
    const f = (M * 1e6) / S;
    const util = (f / fb_MPa) * 100;
    const derivation = `M = wL²/8 = ${M.toFixed(1)} kN·m\nS = b·h²/6 = ${b_mm} × ${h_mm}² / 6 = ${(S / 1000).toFixed(0)} ×10³ mm³\nf_b = M/S = ${f.toFixed(1)} MPa (≤ ${fb_MPa} MPa)\nUtilisation = ${util.toFixed(1)}%`;
    return {
      results: [
        { label: 'Bending moment', value: M, unit: 'kN·m', passes: null, reference: 'SANS 10163-2' },
        { label: 'Section modulus S', value: S / 1000, unit: '×10³ mm³', passes: null, reference: 'b·h²/6' },
        { label: 'Bending stress f_b', value: f, unit: 'MPa', passes: PASS(f, fb_MPa, 'max'), reference: `≤ ${fb_MPa} MPa` },
        { label: 'Utilisation', value: util, unit: '%', passes: PASS(util, 100, 'max'), reference: '≤ 100%' },
      ],
      derivation,
      disclaimers: ['Deflection, lateral stability and bearing checks are not included. Professional verification required.'],
    };
  },
};

export const geotechnical: CalcDefinition = {
  id: 'geo-bearing',
  title: 'Foundation Bearing Pressure',
  standard: 'SANS 10160-5',
  icon: 'eng_geo',
  fields: [
    { key: 'P_kN', label: 'Column load', unit: 'kN', default: 850 },
    { key: 'B_m', label: 'Footing width B', unit: 'm', default: 2.2 },
    { key: 'L_m', label: 'Footing length L', unit: 'm', default: 2.2 },
    { key: 'q_allow_kPa', label: 'Allowable bearing', unit: 'kPa', default: 180 },
    { key: 'depth_m', label: 'Foundation depth', unit: 'm', default: 1.2 },
    { key: 'soil_density_kN_m3', label: 'Soil density', unit: 'kN/m³', default: 18 },
  ],
  calculate: ({ P_kN, B_m, L_m, q_allow_kPa, depth_m, soil_density_kN_m3 }) => {
    const A = B_m * L_m;
    const soil_wt = depth_m * soil_density_kN_m3;
    const q_net = P_kN / A + soil_wt;
    const util = (q_net / q_allow_kPa) * 100;
    const derivation = `A = B·L = ${B_m} × ${L_m} = ${A.toFixed(2)} m²\nOverburden = D·γ = ${depth_m} × ${soil_density_kN_m3} = ${soil_wt.toFixed(0)} kPa\nq_net = P/A + overburden = ${(P_kN / A).toFixed(0)} + ${soil_wt.toFixed(0)} = ${q_net.toFixed(0)} kPa\nUtilisation = ${util.toFixed(1)}% (≤ ${q_allow_kPa} kPa)`;
    return {
      results: [
        { label: 'Footing area', value: A, unit: 'm²', passes: null, reference: 'SANS 10160-5' },
        { label: 'Net bearing pressure', value: q_net, unit: 'kPa', passes: PASS(q_net, q_allow_kPa, 'max'), reference: `≤ ${q_allow_kPa} kPa` },
        { label: 'Utilisation', value: util, unit: '%', passes: PASS(util, 100, 'max'), reference: '≤ 100%' },
      ],
      derivation,
      disclaimers: ['Settlement, differential settlement and geotechnical investigation results are not included.'],
    };
  },
};

/* ── Civil ── */

export const windLoad: CalcDefinition = {
  id: 'wind-load',
  title: 'Design Wind Pressure',
  standard: 'SANS 10160-3',
  icon: 'eng_wind',
  fields: [
    { key: 'v_ref', label: 'Reference wind speed', unit: 'm/s', default: 28 },
    { key: 'height_m', label: 'Building height', unit: 'm', default: 15 },
    { key: 'terrain', label: 'Terrain category factor Ce', unit: '—', default: 1 },
    { key: 'Cd', label: 'Drag coefficient Cd', unit: '—', default: 1.2 },
    { key: 'air_density', label: 'Air density', unit: 'kg/m³', default: 1.22 },
  ],
  calculate: ({ v_ref, height_m, terrain, Cd, air_density }) => {
    const q = 0.5 * air_density * v_ref * v_ref;
    const S2 = Math.max(0.7, 0.7 + 0.02 * Math.log(height_m + 1));
    const qz = q * S2 * S2 * terrain;
    const F = qz * Cd;
    const derivation = `q = ½ρv² = ½ × ${air_density} × ${v_ref}² = ${q.toFixed(1)} Pa\nS₂ (height ${height_m} m) = ${S2.toFixed(2)}\nq_z = q·S₂²·Ce = ${qz.toFixed(1)} Pa\nDesign pressure F = q_z·Cd = ${F.toFixed(1)} Pa`;
    return {
      results: [
        { label: 'Dynamic pressure q', value: q, unit: 'Pa', passes: null, reference: 'SANS 10160-3 §7.2' },
        { label: 'Gust/terrain factor', value: S2, unit: '—', passes: null, reference: 'SANS 10160-3 §7.2.2' },
        { label: 'Peak pressure q_z', value: qz, unit: 'Pa', passes: null, reference: 'SANS 10160-3' },
        { label: 'Design force F', value: F, unit: 'Pa', passes: null, reference: 'F = q_z·Cd' },
      ],
      derivation,
      disclaimers: ['Local pressure coefficients for cladding, internal pressure, and dynamic response require a full wind study for significant buildings.'],
    };
  },
};

export const stormwater: CalcDefinition = {
  id: 'stormwater-rational',
  title: 'Rational Method Stormwater Runoff',
  standard: 'SANS 10120-1 / SANRAL Drainage',
  icon: 'eng_storm',
  fields: [
    { key: 'C', label: 'Runoff coefficient', unit: '—', default: 0.7 },
    { key: 'I_mm_hr', label: 'Rainfall intensity', unit: 'mm/hr', default: 90 },
    { key: 'A_ha', label: 'Catchment area', unit: 'ha', default: 1.2 },
  ],
  calculate: ({ C, I_mm_hr, A_ha }) => {
    const Q = 0.278 * C * I_mm_hr * A_ha;
    const derivation = `Q = 0.278·C·I·A = 0.278 × ${C} × ${I_mm_hr} × ${A_ha} = ${Q.toFixed(2)} m³/s`;
    return {
      results: [
        { label: 'Peak runoff Q', value: Q, unit: 'm³/s', passes: null, reference: 'Rational Method' },
      ],
      derivation,
      disclaimers: ['Design storm return period and time of concentration must be verified against local authority requirements.'],
    };
  },
};

/* ── Mechanical / HVAC ── */

export const ductSizing: CalcDefinition = {
  id: 'duct-sizing',
  title: 'Duct Sizing by Velocity',
  standard: 'ASHRAE / SANS 10400-O',
  icon: 'eng_duct',
  fields: [
    { key: 'flow_m3_s', label: 'Airflow', unit: 'm³/s', default: 0.8 },
    { key: 'velocity_m_s', label: 'Design velocity', unit: 'm/s', default: 6 },
  ],
  calculate: ({ flow_m3_s, velocity_m_s }) => {
    const A = flow_m3_s / velocity_m_s;
    const diam = Math.sqrt((4 * A) / Math.PI) * 1000;
    const derivation = `A = Q/v = ${flow_m3_s} / ${velocity_m_s} = ${A.toFixed(3)} m²\nD = √(4A/π) = ${diam.toFixed(0)} mm`;
    return {
      results: [
        { label: 'Required area', value: A, unit: 'm²', passes: null, reference: 'Q = A·v' },
        { label: 'Equivalent diameter', value: diam, unit: 'mm', passes: null, reference: 'Circular equivalent' },
      ],
      derivation,
      disclaimers: ['Pressure drop, fan selection and acoustic design require a full duct design.'],
    };
  },
};

export const heatLoad: CalcDefinition = {
  id: 'heat-gain',
  title: 'Sensible Heating/Cooling Load',
  standard: 'SANS 10400-XA / ASHRAE',
  icon: 'eng_heat',
  fields: [
    { key: 'floor_m2', label: 'Floor area', unit: 'm²', default: 120 },
    { key: 'u_factor', label: 'U-value (glazing)', unit: 'W/m²K', default: 2.8 },
    { key: 'glass_m2', label: 'Glazing area', unit: 'm²', default: 18 },
    { key: 'dT', label: 'Design temperature diff', unit: 'K', default: 12 },
    { key: 'solar_factor', label: 'Solar heat gain SHGC', unit: '—', default: 0.45 },
    { key: 'solar_w_m2', label: 'Peak solar irradiance', unit: 'W/m²', default: 600 },
  ],
  calculate: ({ floor_m2, u_factor, glass_m2, dT, solar_factor, solar_w_m2 }) => {
    const conduction = u_factor * glass_m2 * dT;
    const solar = solar_factor * glass_m2 * solar_w_m2;
    const total = conduction + solar + 10 * floor_m2;
    const cooling = total / 1000;
    const derivation = `Conduction = U·A·ΔT = ${u_factor} × ${glass_m2} × ${dT} = ${conduction.toFixed(0)} W\nSolar gain = SHGC·A·I = ${solar_factor} × ${glass_m2} × ${solar_w_m2} = ${solar.toFixed(0)} W\nInternal load ≈ 10 W/m² × ${floor_m2} = ${10 * floor_m2} W\nTotal = ${total.toFixed(0)} W = ${cooling.toFixed(1)} kW`;
    return {
      results: [
        { label: 'Conduction gain', value: conduction, unit: 'W', passes: null, reference: 'SANS 10400-XA §4' },
        { label: 'Solar gain', value: solar, unit: 'W', passes: null, reference: 'SHGC method' },
        { label: 'Total cooling load', value: cooling, unit: 'kW', passes: null, reference: 'Design estimate' },
      ],
      derivation,
      disclaimers: ['Preliminary estimate. Detailed load calculations must follow the certified method.'],
    };
  },
};

/* ── Fire Engineering ── */

export const travelDistance: CalcDefinition = {
  id: 'travel-distance',
  title: 'Escape Route Travel Distance',
  standard: 'SANS 10400-T',
  icon: 'eng_escape',
  fields: [
    { key: 'occupancy_class', label: 'Occupancy factor', unit: '—', default: 1 },
    { key: 'dead_end_m', label: 'Dead-end travel distance', unit: 'm', default: 6 },
    { key: 'max_dead_end', label: 'Max dead-end limit', unit: 'm', default: 15 },
    { key: 'max_travel', label: 'Max overall travel', unit: 'm', default: 45 },
  ],
  calculate: ({ occupancy_class, dead_end_m, max_dead_end, max_travel }) => {
    const scale = occupancy_class || 1;
    const deadOk = dead_end_m * scale <= max_dead_end;
    const derivation = `Dead-end distance = ${dead_end_m} m (limit ${max_dead_end} m)\nOccupancy factor = ${scale}\nDead-end check: ${deadOk ? 'PASS' : 'FAIL'} — travel distance within ${max_travel} m of an exit must be confirmed on the plan.`;
    return {
      results: [
        { label: 'Dead-end distance', value: dead_end_m, unit: 'm', passes: deadOk, reference: `≤ ${max_dead_end} m` },
        { label: 'Occupancy factor', value: scale, unit: '—', passes: null, reference: 'SANS 10400-T Table 3' },
      ],
      derivation,
      disclaimers: ['Escape width, occupant load and final exit capacity must be verified on the approved plans.'],
    };
  },
};

export const fireResistance: CalcDefinition = {
  id: 'fire-resistance',
  title: 'Fire Resistance Rating (FRR)',
  standard: 'SANS 10400-T / SANS 10121',
  icon: 'eng_fire',
  fields: [
    { key: 'occupancy', label: 'Occupancy class', unit: '—', default: 1 },
    { key: 'storeys', label: 'Number of storeys', unit: '—', default: 3 },
    { key: 'height_m', label: 'Building height', unit: 'm', default: 11 },
  ],
  calculate: ({ occupancy, storeys, height_m }) => {
    let frr = 30;
    if (storeys >= 4 || height_m > 15) frr = 120;
    else if (storeys >= 2 || height_m > 8) frr = 60;
    const derivation = `Storeys = ${storeys}, height = ${height_m} m\nSelected FRR = ${frr} minutes structural element rating`;
    return {
      results: [
        { label: 'Recommended FRR', value: frr, unit: 'min', passes: null, reference: 'SANS 10400-T Table 1' },
      ],
      derivation,
      disclaimers: ['Rational design by a competent fire engineer may modify these prescriptive values.'],
    };
  },
};

export const fireWater: CalcDefinition = {
  id: 'fire-water',
  title: 'Fire Hydrant Flow Requirement',
  standard: 'SANS 10400-T / SANS 10089-2',
  icon: 'eng_hydrant',
  fields: [
    { key: 'floor_area_m2', label: 'Floor area', unit: 'm²', default: 2500 },
    { key: 'storeys', label: 'Storeys', unit: '—', default: 2 },
    { key: 'occupancy', label: 'Occupancy factor', unit: '—', default: 1 },
  ],
  calculate: ({ floor_area_m2, storeys, occupancy }) => {
    const q = 25 + Math.floor(floor_area_m2 / 500) * 5;
    const min = 25;
    const flow = Math.max(q, min);
    const derivation = `Flow = 25 L/s base + increments (${floor_area_m2} m², ${storeys} storeys)\nRequired fire flow ≈ ${flow} L/s`;
    return {
      results: [
        { label: 'Fire flow', value: flow, unit: 'L/s', passes: null, reference: 'SANS 10400-T' },
      ],
      derivation,
      disclaimers: ['Hydrant spacing, hose distance and municipal supply verification required.'],
    };
  },
};

/* ── Electrical ── */

export const cableSizing: CalcDefinition = {
  id: 'cable-sizing',
  title: 'Cable Sizing & Voltage Drop',
  standard: 'SANS 10142-1',
  icon: 'eng_cable',
  fields: [
    { key: 'I_A', label: 'Design current', unit: 'A', default: 32 },
    { key: 'length_m', label: 'Cable length', unit: 'm', default: 25 },
    { key: 'voltage_V', label: 'System voltage', unit: 'V', default: 230 },
    { key: 'resistance', label: 'Resistance (mΩ/m)', unit: 'mΩ/m', default: 7.4 },
    { key: 'pf', label: 'Power factor', unit: '—', default: 0.95 },
  ],
  calculate: ({ I_A, length_m, voltage_V, resistance, pf }) => {
    const vd = (2 * I_A * length_m * resistance * pf) / 1000;
    const vdPct = (vd / voltage_V) * 100;
    const maxPct = 5;
    const derivation = `VD = 2·I·L·R·cosφ = 2 × ${I_A} × ${length_m} × ${resistance} × ${pf} / 1000 = ${vd.toFixed(2)} V\nVD% = ${vdPct.toFixed(2)}% (≤ ${maxPct}%)`;
    return {
      results: [
        { label: 'Voltage drop', value: vd, unit: 'V', passes: null, reference: 'SANS 10142-1 §6.14' },
        { label: 'Voltage drop %', value: vdPct, unit: '%', passes: PASS(vdPct, maxPct, 'max'), reference: `≤ ${maxPct}%` },
      ],
      derivation,
      disclaimers: ['Cable current-carrying capacity, derating and protection coordination not included.'],
    };
  },
};

export const maxDemand: CalcDefinition = {
  id: 'max-demand',
  title: 'Maximum Demand & DB Sizing',
  standard: 'SANS 10142-1 Table 8.4',
  icon: 'eng_db',
  fields: [
    { key: 'lighting_W', label: 'Lighting load', unit: 'W', default: 3000 },
    { key: 'socket_W', label: 'Socket outlets', unit: 'W', default: 5000 },
    { key: 'appliance_W', label: 'Major appliances', unit: 'W', default: 4000 },
    { key: 'demand_factor', label: 'Demand factor', unit: '—', default: 0.75 },
  ],
  calculate: ({ lighting_W, socket_W, appliance_W, demand_factor }) => {
    const total = (lighting_W + socket_W + appliance_W) * demand_factor;
    const I = total / 230;
    const derivation = `Total = (${lighting_W} + ${socket_W} + ${appliance_W}) × ${demand_factor} = ${total.toFixed(0)} W\nDesign current = ${total.toFixed(0)} / 230 = ${I.toFixed(1)} A`;
    return {
      results: [
        { label: 'Maximum demand', value: total, unit: 'W', passes: null, reference: 'SANS 10142-1 Table 8.4' },
        { label: 'Design current', value: I, unit: 'A', passes: null, reference: 'I = P/V' },
      ],
      derivation,
      disclaimers: ['Final DB rating and consumer mains sizing require the full electrical design.'],
    };
  },
};

/* ── Wet Services ── */

export const coldWater: CalcDefinition = {
  id: 'cold-water',
  title: 'Cold Water Pipe Sizing',
  standard: 'SANS 10252-1',
  icon: 'eng_water',
  fields: [
    { key: 'fixtures', label: 'Number of fixtures', unit: '—', default: 12 },
    { key: 'peak_factor', label: 'Peak factor', unit: '—', default: 0.6 },
    { key: 'velocity_m_s', label: 'Max velocity', unit: 'm/s', default: 2.4 },
    { key: 'avg_flow_L_min', label: 'Avg fixture flow', unit: 'L/min', default: 8 },
  ],
  calculate: ({ fixtures, peak_factor, avg_flow_L_min, velocity_m_s }) => {
    const Q_L_s = (fixtures * avg_flow_L_min * peak_factor) / 60;
    const A = Q_L_s / 1000 / velocity_m_s;
    const d = Math.sqrt((4 * A) / Math.PI) * 1000;
    const derivation = `Peak flow = ${fixtures} × ${avg_flow_L_min} L/min × ${peak_factor} = ${(fixtures * avg_flow_L_min * peak_factor).toFixed(0)} L/min\nQ = ${Q_L_s.toFixed(2)} L/s\nA = Q/v → d = ${d.toFixed(0)} mm`;
    return {
      results: [
        { label: 'Peak flow', value: Q_L_s, unit: 'L/s', passes: null, reference: 'SANS 10252-1' },
        { label: 'Min pipe diameter', value: d, unit: 'mm', passes: null, reference: 'Velocity ≤ 2.4 m/s' },
      ],
      derivation,
      disclaimers: ['Pressure loss, static head and municipal supply pressure must be verified.'],
    };
  },
};

export const drainageFu: CalcDefinition = {
  id: 'drainage-fu',
  title: 'Drainage Fixture Units',
  standard: 'SANS 10252-2',
  icon: 'eng_drain',
  fields: [
    { key: 'wc', label: 'Water closets', unit: 'FU each', default: 6, min: 0 },
    { key: 'basins', label: 'Basins', unit: 'FU each', default: 6, min: 0 },
    { key: 'showers', label: 'Showers', unit: 'FU each', default: 4, min: 0 },
    { key: 'urinals', label: 'Urinals', unit: 'FU each', default: 2, min: 0 },
  ],
  calculate: ({ wc, basins, showers, urinals }) => {
    const fu = wc * 8 + basins * 1 + showers * 2 + urinals * 4;
    const d = fu <= 10 ? 50 : fu <= 30 ? 75 : fu <= 60 ? 100 : 150;
    const derivation = `FU = ${wc}×8 + ${basins}×1 + ${showers}×2 + ${urinals}×4 = ${fu}\nRequired drain diameter = ${d} mm`;
    return {
      results: [
        { label: 'Total fixture units', value: fu, unit: 'FU', passes: null, reference: 'SANS 10252-2 Table 1' },
        { label: 'Drain diameter', value: d, unit: 'mm', passes: null, reference: 'SANS 10252-2' },
      ],
      derivation,
      disclaimers: ['Gradient, venting and storm separation must follow the drainage design.'],
    };
  },
};

export const geyserSizing: CalcDefinition = {
  id: 'geyser-sizing',
  title: 'Hot Water System Sizing',
  standard: 'SANS 10400-XA §6.1 / SANS 10252-1',
  icon: 'eng_hotwater',
  fields: [
    { key: 'occupants', label: 'Occupants', unit: '—', default: 4 },
    { key: 'litres_per_person', label: 'L/person/day', unit: 'L', default: 50 },
    { key: 'dT', label: 'Temperature rise', unit: 'K', default: 50 },
    { key: 'solar_fraction', label: 'Solar fraction', unit: '—', default: 0 },
  ],
  calculate: ({ occupants, litres_per_person, dT, solar_fraction }) => {
    const volume = occupants * litres_per_person;
    const energy = (volume * 4.186 * dT) / 3600;
    const solar_energy = energy * solar_fraction;
    const net = Math.max(0, energy - solar_energy);
    const tank = Math.ceil(volume / 50) * 50;
    const derivation = `Volume = ${occupants} × ${litres_per_person} = ${volume} L/day\nEnergy = V·c·ΔT = ${energy.toFixed(1)} kWh/day\nSolar contribution = ${(solar_energy).toFixed(1)} kWh (${(solar_fraction * 100).toFixed(0)}%)\nNet electric = ${net.toFixed(1)} kWh/day → tank ≈ ${tank} L`;
    return {
      results: [
        { label: 'Daily hot water', value: volume, unit: 'L', passes: null, reference: 'SANS 10252-1' },
        { label: 'Daily energy', value: energy, unit: 'kWh', passes: null, reference: 'SANS 10400-XA §6.1' },
        { label: 'Net energy (after solar)', value: net, unit: 'kWh', passes: null, reference: 'Solar fraction input' },
        { label: 'Recommended tank', value: tank, unit: 'L', passes: null, reference: 'Standard tank sizes' },
      ],
      derivation,
      disclaimers: ['XA compliance may require solar or heat-pump contribution per SANS 10400-XA Table 6.'],
    };
  },
};

/* ── Utilities ── */

export const unitConverter: CalcDefinition = {
  id: 'unit-converter',
  title: 'Unit Converter & Reference',
  standard: 'Reference utility',
  icon: 'eng_units',
  fields: [
    { key: 'value', label: 'Value', unit: '—', default: 100 },
    { key: 'conversion_id', label: 'Conversion (1-5)', unit: '—', default: 1, min: 1, max: 5 },
  ],
  calculate: ({ value, conversion_id }) => {
    const id = Math.round(conversion_id);
    const conversions: Record<number, [number, string, string]> = {
      1: [0.3048, 'ft → m', 'm'],
      2: [1.356, 'ft·lb → N·m', 'N·m'],
      3: [4.1868, 'kcal → kJ', 'kJ'],
      4: [6.8948, 'psi → kPa', 'kPa'],
      5: [0.0929, 'ft² → m²', 'm²'],
    };
    const [factor, from, unit] = conversions[id] || conversions[1];
    const result = value * factor;
    const derivation = `${value} ${from.split('→')[0].trim()} × ${factor} = ${result.toFixed(2)} ${unit}`;
    return {
      results: [
        { label: `Converted (${from})`, value: result, unit, passes: null, reference: 'Standard conversion' },
      ],
      derivation,
      disclaimers: ['Reference utility only — confirm against authoritative conversion tables.'],
    };
  },
};

/* ── Registry ── */

export const CALC_REGISTRY: Record<string, CalcDefinition> = {
  'steel-beam': steelBeam,
  'concrete-beam': concreteBeam,
  'timber-beam': timberBeam,
  'geo-bearing': geotechnical,
  'wind-load': windLoad,
  'stormwater-rational': stormwater,
  'duct-sizing': ductSizing,
  'heat-gain': heatLoad,
  'travel-distance': travelDistance,
  'fire-resistance': fireResistance,
  'fire-water': fireWater,
  'cable-sizing': cableSizing,
  'max-demand': maxDemand,
  'cold-water': coldWater,
  'drainage-fu': drainageFu,
  'geyser-sizing': geyserSizing,
  'unit-converter': unitConverter,
};

export function runCalculation(calcId: string, inputs: CalcInputs): CalcOutput {
  const def = CALC_REGISTRY[calcId];
  if (!def) {
    return {
      results: [],
      derivation: 'Unknown calculator',
      disclaimers: ['No calculation definition exists for this calculator.'],
    };
  }
  return def.calculate(inputs);
}

export function defaultInputs(calcId: string): CalcInputs {
  const def = CALC_REGISTRY[calcId];
  if (!def) return {};
  const inputs: CalcInputs = {};
  def.fields.forEach((f) => {
    inputs[f.key] = f.default;
  });
  return inputs;
}
