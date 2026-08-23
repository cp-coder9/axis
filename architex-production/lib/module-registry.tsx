'use client';

import React from 'react';
import { ProjectEntity, RoleKey, ToolDefinition } from '@/lib/types';

// Flagship & foundation modules
import { MeetingsModule } from '@/components/modules/MeetingsModule';
import { PracticeModule } from '@/components/modules/PracticeModule';
import { WingmanModule } from '@/components/modules/WingmanModule';
import { EngineeringCalcModule } from '@/components/modules/EngineeringCalcModule';
import { TownPlanningModule } from '@/components/modules/TownPlanningModule';
import { MunicipalModule } from '@/components/modules/MunicipalModule';
import { XaEnergyModule } from '@/components/modules/XaEnergyModule';
import { FormsModule } from '@/components/modules/FormsModule';
import { SpecForgeModule } from '@/components/modules/SpecForgeModule';
import { BomModule } from '@/components/modules/BomModule';
import { ItpModule } from '@/components/modules/ItpModule';
import { SafetyModule } from '@/components/modules/SafetyModule';
import { FeedbackModule } from '@/components/modules/FeedbackModule';
import { ProjectPassportModule } from '@/components/modules/ProjectPassportModule';
import { DocumentsDrawingsModule } from '@/components/modules/DocumentsDrawingsModule';
import { ActionCentreModule } from '@/components/modules/ActionCentreModule';
import { ApprovalsModule } from '@/components/modules/ApprovalsModule';
import { IssuesRfisModule } from '@/components/modules/IssuesRfisModule';
import { SiteInstructionsModule } from '@/components/modules/SiteInstructionsModule';
import { NcrManagerModule } from '@/components/modules/NcrManagerModule';
import { SnagManagerModule } from '@/components/modules/SnagManagerModule';
import { FeeProposalModule } from '@/components/modules/FeeProposalModule';
import { RfqMarketplaceModule } from '@/components/modules/RfqMarketplaceModule';
import { SupplierCatalogModule } from '@/components/modules/SupplierCatalogModule';
import { ContractAdminModule } from '@/components/modules/ContractAdminModule';
import { ProfessionalDirectoryModule } from '@/components/modules/ProfessionalDirectoryModule';
import { TeamWorkspaceModule } from '@/components/modules/TeamWorkspaceModule';
import { ComplianceHubModule } from '@/components/modules/ComplianceHubModule';
import { EnvironmentalHeritageModule } from '@/components/modules/EnvironmentalHeritageModule';
import { BimIfcModule } from '@/components/modules/BimIfcModule';
import { SurveyGeomaticsModule } from '@/components/modules/SurveyGeomaticsModule';
import { ProjectExplorerModule } from '@/components/modules/ProjectExplorerModule';
import { RefuseCalculatorModule } from '@/components/modules/RefuseCalculatorModule';
import { NhbrcEnrolmentModule } from '@/components/modules/NhbrcEnrolmentModule';
import { InsuranceRegisterModule } from '@/components/modules/InsuranceRegisterModule';
import { PaymentsEscrowModule } from '@/components/modules/PaymentsEscrowModule';
import { CouncilNavigatorModule } from '@/components/modules/CouncilNavigatorModule';
import { MunicipalTrackerModule } from '@/components/modules/MunicipalTrackerModule';
import { EiaWorkspaceModule } from '@/components/modules/EiaWorkspaceModule';
import { MarketInsightsModule } from '@/components/modules/MarketInsightsModule';
import { ContractorComplianceModule } from '@/components/modules/ContractorComplianceModule';
import { DisputeResolutionModule } from '@/components/modules/DisputeResolutionModule';
import { FmBridgeModule } from '@/components/modules/FmBridgeModule';
import { RemoteDesktopModule } from '@/components/modules/RemoteDesktopModule';
import { CpdLearningModule } from '@/components/modules/CpdLearningModule';
import { AdminReviewModule } from '@/components/modules/AdminReviewModule';
import { IconographyRegistryModule } from '@/components/modules/IconographyRegistryModule';
import { ScaffoldModule } from '@/components/modules/ScaffoldModule';

export interface ModuleRouterProps {
  toolId: string;
  tool: ToolDefinition;
  activeProject: ProjectEntity;
  currentRole: RoleKey;
  activeTabKey: string;
  isProjectMode: boolean;
  onNavigateTool: (toolId: string) => void;
  onOpenWingman: () => void;
  onTabChange?: (key: string) => void;
}

type ModuleComponent =
  | React.ComponentType<{ activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onNavigateTool?: (toolId: string) => void; onOpenWingman?: () => void; onTabChange?: (key: string) => void }>;

/**
 * Registry-driven module dispatch. Adding a graduated module is one entry here
 * instead of another conditional branch in app/page.tsx.
 */
const MODULE_REGISTRY: Record<string, ModuleComponent> = {
  meetings: MeetingsModule as unknown as ModuleComponent,
  practice: PracticeModule as unknown as ModuleComponent,
  wingman: WingmanModule as unknown as ModuleComponent,
  engineering_calc: EngineeringCalcModule as unknown as ModuleComponent,
  planning: TownPlanningModule as unknown as ModuleComponent,
  municipal: MunicipalModule as unknown as ModuleComponent,
  xa: XaEnergyModule as unknown as ModuleComponent,
  forms: FormsModule as unknown as ModuleComponent,
  specforge: SpecForgeModule as unknown as ModuleComponent,
  bom: BomModule as unknown as ModuleComponent,
  itp: ItpModule as unknown as ModuleComponent,
  issues_rfis: IssuesRfisModule as unknown as ModuleComponent,
  site_instructions: SiteInstructionsModule as unknown as ModuleComponent,
  ncr_manager: NcrManagerModule as unknown as ModuleComponent,
  snag_manager: SnagManagerModule as unknown as ModuleComponent,
  fee_proposal: FeeProposalModule as unknown as ModuleComponent,
  rfq_marketplace: RfqMarketplaceModule as unknown as ModuleComponent,
  supplier_catalog: SupplierCatalogModule as unknown as ModuleComponent,
  contract_admin: ContractAdminModule as unknown as ModuleComponent,
  professional_directory: ProfessionalDirectoryModule as unknown as ModuleComponent,
  team_workspace: TeamWorkspaceModule as unknown as ModuleComponent,
  compliance_hub: ComplianceHubModule as unknown as ModuleComponent,
  environmental_heritage: EnvironmentalHeritageModule as unknown as ModuleComponent,
  bim_ifc: BimIfcModule as unknown as ModuleComponent,
  survey_geomatics: SurveyGeomaticsModule as unknown as ModuleComponent,
  project_explorer: ProjectExplorerModule as unknown as ModuleComponent,
  refuse_calculator: RefuseCalculatorModule as unknown as ModuleComponent,
  nhbrc_enrolment: NhbrcEnrolmentModule as unknown as ModuleComponent,
  insurance_register: InsuranceRegisterModule as unknown as ModuleComponent,
  payments_escrow: PaymentsEscrowModule as unknown as ModuleComponent,
  council_navigator: CouncilNavigatorModule as unknown as ModuleComponent,
  municipal_tracker: MunicipalTrackerModule as unknown as ModuleComponent,
  eia_workspace: EiaWorkspaceModule as unknown as ModuleComponent,
  market_insights: MarketInsightsModule as unknown as ModuleComponent,
  contractor_compliance: ContractorComplianceModule as unknown as ModuleComponent,
  dispute_resolution: DisputeResolutionModule as unknown as ModuleComponent,
  fm_bridge: FmBridgeModule as unknown as ModuleComponent,
  remote_desktop: RemoteDesktopModule as unknown as ModuleComponent,
  cpd_learning: CpdLearningModule as unknown as ModuleComponent,
  admin_review: AdminReviewModule as unknown as ModuleComponent,
  iconography_registry: IconographyRegistryModule as unknown as ModuleComponent,
  safety: SafetyModule as unknown as ModuleComponent,
  feedback: FeedbackModule as unknown as ModuleComponent,
  project_passport: ProjectPassportModule as unknown as ModuleComponent,
  documents_drawings: DocumentsDrawingsModule as unknown as ModuleComponent,
  inbox_action: ActionCentreModule as unknown as ModuleComponent,
  approvals_queue: ApprovalsModule as unknown as ModuleComponent,
};

export function ModuleRouter({
  toolId,
  tool,
  activeProject,
  currentRole,
  activeTabKey,
  isProjectMode,
  onNavigateTool,
  onOpenWingman,
  onTabChange,
}: ModuleRouterProps) {
  const Module = MODULE_REGISTRY[toolId];
  if (!Module) {
    return (
      <ScaffoldModule
        tool={tool}
        activeProject={activeProject}
        currentRole={currentRole}
        activeTabKey={activeTabKey}
        isProjectMode={isProjectMode}
        onOpenWingman={onOpenWingman}
        onTabChange={onTabChange}
      />
    );
  }
  return (
    <Module
      activeProject={activeProject}
      currentRole={currentRole}
      activeTabKey={activeTabKey}
      isProjectMode={isProjectMode}
      onNavigateTool={onNavigateTool}
      onOpenWingman={onOpenWingman}
      onTabChange={onTabChange}
    />
  );
}
