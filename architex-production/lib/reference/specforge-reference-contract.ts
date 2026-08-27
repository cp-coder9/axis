import rawContract from '@/generated/specforge-reference-contract.json';

export interface SpecForgeReferenceView {
  readonly id: string;
  readonly label: string;
  readonly renderer: string;
  readonly icon: string;
}

export interface SpecForgeReferenceContract {
  readonly schemaVersion: 1;
  readonly sourcePath: string;
  readonly sourceSha256: string;
  readonly embeddedSourceSha256: string;
  readonly views: readonly SpecForgeReferenceView[];
  readonly procurementPipeline: readonly string[];
}

const candidate: unknown = rawContract;
if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
  throw new Error('Invalid generated SpecForge reference contract');
}

const contract = candidate as Partial<SpecForgeReferenceContract>;
const ids = contract.views?.map((view) => view.id) ?? [];
if (
  contract.schemaVersion !== 1
  || ids.length !== 14
  || new Set(ids).size !== 14
  || ids[0] !== 'overview'
  || ids.at(-1) !== 'integration'
  || contract.procurementPipeline?.join(',') !== 'RFQ Pending,Quoted,PO Raised,Ordered,In Transit,Delivered,Installed'
) {
  throw new Error('Generated SpecForge reference contract failed invariant validation');
}

export const SPECFORGE_REFERENCE_CONTRACT = candidate as SpecForgeReferenceContract;
export const SPECFORGE_REFERENCE_VIEWS = SPECFORGE_REFERENCE_CONTRACT.views;
export const SPECFORGE_PROCUREMENT_PIPELINE = SPECFORGE_REFERENCE_CONTRACT.procurementPipeline;
