import { expect, test, type Page } from '@playwright/test';
import { CANONICAL_MODULE_COUNT, MODULE_CONTRACTS, type ModuleContract } from './fixtures/module-contracts';
import { openMigratedTool } from './helpers/v8-migration';

function missingContractIds(): string[] {
  const canonical = [
    'meetings', 'practice', 'wingman', 'engineering_calc', 'planning', 'municipal', 'xa', 'forms', 'specforge', 'bom', 'itp', 'safety', 'feedback', 'project_passport', 'project_explorer', 'professional_directory', 'team_workspace', 'inbox_action', 'issues_rfis', 'approvals_queue', 'compliance_hub', 'environmental_heritage', 'eia_workspace', 'refuse_calculator', 'nhbrc_enrolment', 'documents_drawings', 'survey_geomatics', 'bim_ifc', 'fee_proposal', 'insurance_register', 'rfq_marketplace', 'supplier_catalog', 'market_insights', 'contract_admin', 'payments_escrow', 'dispute_resolution', 'contractor_compliance', 'site_instructions', 'ncr_manager', 'snag_manager', 'fm_bridge', 'council_navigator', 'municipal_tracker', 'remote_desktop', 'cpd_learning', 'admin_review', 'iconography_registry',
  ];
  const covered = new Set(MODULE_CONTRACTS.map((contract) => contract.id));
  return canonical.filter((id) => !covered.has(id));
}

async function executeContract(contract: ModuleContract, page: Page) {
  await openMigratedTool(page, contract.id);
  await expect(page.locator('body')).toContainText(contract.readAssertion);

  const target = contract.interaction.target.kind === 'testId'
    ? page.getByTestId(contract.interaction.target.value)
    : page.locator(`[aria-label="${contract.landmark}"]`).getByRole('button', { name: contract.interaction.target.value });
  await target.click();

  if (contract.interaction.observable.kind === 'role') {
    await expect(page.getByRole(contract.interaction.observable.value as 'alert')).toBeVisible();
  } else {
    await expect(page.getByText(contract.interaction.observable.value, { exact: false }).first()).toBeVisible();
  }
}

test.describe('Phase 8 module functional contracts', () => {
  test('has a unique evidence-bearing contract for every canonical module', () => {
    const ids = MODULE_CONTRACTS.map((contract) => contract.id);
    expect(new Set(ids).size, 'P8-FUNCTIONAL-DUPLICATE-CONTRACT').toBe(ids.length);
    expect(ids.length, `P8-FUNCTIONAL-MISSING-CONTRACTS|missing=${missingContractIds().join(',')}`).toBe(CANONICAL_MODULE_COUNT);
  });

  for (const contract of MODULE_CONTRACTS) {
    test(`${contract.id}: ${contract.readAssertion} action has an observable result`, async ({ page }) => {
      await executeContract(contract, page);
    });
  }
});
