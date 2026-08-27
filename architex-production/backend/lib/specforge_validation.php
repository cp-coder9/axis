<?php
declare(strict_types=1);

if (!class_exists('SpecForgeRepositoryError')) {
    final class SpecForgeRepositoryError extends RuntimeException
    {
        public function __construct(public readonly int $httpStatus, string $message)
        {
            parent::__construct($message);
        }
    }
}

const SPECFORGE_CAPABILITIES = [
    'architect' => ['view', 'edit', 'decide', 'issue', 'drawing_request'],
    'bep' => ['view', 'edit', 'decide', 'issue', 'drawing_request'],
    'engineer' => ['view', 'edit', 'decide'],
    'energy_professional' => ['view', 'edit', 'decide'],
    'fire_engineer' => ['view', 'edit', 'decide'],
    'quantity_surveyor' => ['view', 'review_budget'],
    'client' => ['view', 'decide'],
    'developer' => ['view', 'decide'],
    'contractor' => ['view', 'edit'],
    'subcontractor' => ['view', 'edit'],
    'supplier' => ['view', 'edit'],
    'site_manager' => ['view', 'site_update'],
    'firm_admin' => ['view'],
    'organisation_admin' => ['view', 'govern'],
    'admin' => ['view', 'govern'],
    'platform_admin' => ['view', 'edit', 'review_budget', 'decide', 'issue', 'drawing_request', 'site_update', 'govern'],
];

const SPECFORGE_ISSUED_STATUSES = ['issued', 'rfq', 'ordered', 'delivered', 'installed', 'as_built'];
const SPECFORGE_ASSIGNED_ROLES = ['engineer', 'energy_professional', 'fire_engineer'];
const SPECFORGE_PACKAGE_ROLES = ['subcontractor', 'supplier'];

/**
 * Presentation capabilities intentionally describe discoverability only. Route
 * authorization remains enforced by specforge_require_capability(), including
 * organization, project and record-scope checks.
 *
 * @return array<string,list<string>>
 */
function specforge_capabilities(): array
{
    return [
        'view' => ['architect', 'bep', 'engineer', 'energy_professional', 'fire_engineer', 'quantity_surveyor', 'client', 'developer', 'contractor', 'subcontractor', 'supplier', 'site_manager', 'organisation_admin', 'admin', 'platform_admin'],
        'author' => ['architect', 'bep', 'engineer', 'energy_professional', 'fire_engineer', 'contractor', 'subcontractor', 'supplier', 'platform_admin'],
        'create_workspace' => ['architect', 'bep', 'organisation_admin', 'admin', 'platform_admin'],
        'issue' => ['architect', 'bep', 'platform_admin'],
        'review_budget' => ['architect', 'bep', 'quantity_surveyor', 'platform_admin'],
        'drawing_request' => ['architect', 'bep', 'engineer', 'energy_professional', 'fire_engineer', 'platform_admin'],
    ];
}

/**
 * Enforce project membership, capability and record scope. God Mode is
 * intentionally ignored: it changes discoverability, never authorization.
 */
function specforge_require_capability(array $identity, string $capability, ?array $record = null): void
{
    $role = strtolower((string) ($identity['role'] ?? ''));
    $capabilities = SPECFORGE_CAPABILITIES[$role] ?? [];
    $identityOrganization = (string) ($identity['org'] ?? '');
    $recordOrganization = (string) ($record['organization_id'] ?? $identityOrganization);
    if ($identityOrganization === '' || $recordOrganization !== $identityOrganization) {
        throw new SpecForgeRepositoryError(403, 'SpecForge access denied.');
    }

    $recordProject = isset($record['project_id']) ? (string) $record['project_id'] : null;
    $projects = array_map('strval', is_array($identity['projects'] ?? null) ? $identity['projects'] : []);
    if ($recordProject !== null && !in_array('*', $projects, true) && !in_array($recordProject, $projects, true)) {
        throw new SpecForgeRepositoryError(403, 'SpecForge project access denied.');
    }
    if (!in_array($capability, $capabilities, true)) {
        throw new SpecForgeRepositoryError(403, 'SpecForge capability denied.');
    }
    if ($record === null) return;

    if (in_array($role, ['client', 'developer'], true) && array_key_exists('client_decision', $record) && !((bool) $record['client_decision'])) {
        throw new SpecForgeRepositoryError(403, 'SpecForge client-decision scope denied.');
    }
    if (in_array($role, SPECFORGE_ASSIGNED_ROLES, true) && (array_key_exists('owner_role', $record) || array_key_exists('reviewer_role', $record) || array_key_exists('approver_role', $record))) {
        $assignedRoles = [$record['owner_role'] ?? null, $record['reviewer_role'] ?? null, $record['approver_role'] ?? null];
        if (!in_array($role, $assignedRoles, true)) {
            throw new SpecForgeRepositoryError(403, 'SpecForge assignment scope denied.');
        }
    }
    if (in_array($role, SPECFORGE_PACKAGE_ROLES, true) && array_key_exists('package_name', $record)) {
        $packages = array_map('strval', is_array($identity['package_names'] ?? null) ? $identity['package_names'] : []);
        if (!in_array((string) ($record['package_name'] ?? ''), $packages, true)) {
            throw new SpecForgeRepositoryError(403, 'SpecForge package scope denied.');
        }
        if ($capability === 'view' && !in_array((string) ($record['status'] ?? ''), SPECFORGE_ISSUED_STATUSES, true)) {
            throw new SpecForgeRepositoryError(403, 'SpecForge issued-scope access denied.');
        }
    }
    if (in_array($role, ['contractor', 'site_manager'], true) && $capability === 'view' && array_key_exists('status', $record)
        && !in_array((string) ($record['status'] ?? ''), SPECFORGE_ISSUED_STATUSES, true)) {
        throw new SpecForgeRepositoryError(403, 'SpecForge issued-scope access denied.');
    }
}

/** @return array<string,string> */
function specforge_validate_item_payload(array $body, bool $partial = false): array
{
    $errors = [];
    $allowed = [
        'section_id', 'code', 'title', 'room', 'package_name', 'description', 'image_url',
        'supplier', 'model', 'finish', 'dimensions', 'budget_allowance', 'estimated_cost',
        'lead_time_days', 'client_decision', 'owner_role', 'reviewer_role', 'approver_role',
        'status', 'source_revision', 'superseded_by',
    ];
    foreach (array_keys($body) as $field) {
        if (!in_array($field, $allowed, true)) $errors[$field] = 'Unexpected field.';
    }

    $required = ['section_id', 'code', 'title', 'description', 'owner_role', 'status', 'source_revision'];
    if (!$partial) {
        foreach ($required as $field) {
            if (!array_key_exists($field, $body) || !is_string($body[$field]) || trim($body[$field]) === '') $errors[$field] = 'Required.';
        }
    }

    $lengths = [
        'section_id' => 36, 'code' => 64, 'title' => 220, 'room' => 180, 'package_name' => 180,
        'supplier' => 180, 'model' => 180, 'finish' => 180, 'dimensions' => 180,
        'image_url' => 2048, 'owner_role' => 64, 'reviewer_role' => 64, 'approver_role' => 64,
        'source_revision' => 64, 'superseded_by' => 36,
    ];
    foreach ($lengths as $field => $maximum) {
        if (!array_key_exists($field, $body) || $body[$field] === null) continue;
        if (!is_string($body[$field]) || mb_strlen($body[$field]) > $maximum) $errors[$field] = "Must be a string no longer than {$maximum} characters.";
    }
    foreach (['budget_allowance', 'estimated_cost'] as $field) {
        if (array_key_exists($field, $body) && (!is_numeric($body[$field]) || !is_finite((float) $body[$field]) || (float) $body[$field] < 0)) {
            $errors[$field] = 'Must be a finite non-negative amount.';
        }
    }
    if (array_key_exists('lead_time_days', $body) && (!is_int($body['lead_time_days']) || $body['lead_time_days'] < 0 || $body['lead_time_days'] > 3650)) {
        $errors['lead_time_days'] = 'Must be an integer from 0 to 3650.';
    }
    if (array_key_exists('client_decision', $body) && !is_bool($body['client_decision'])) $errors['client_decision'] = 'Must be a boolean.';

    $statuses = ['draft', 'needs_decision', 'approved', 'issued', 'rfq', 'ordered', 'delivered', 'installed', 'as_built', 'superseded'];
    if (array_key_exists('status', $body) && (!is_string($body['status']) || !in_array($body['status'], $statuses, true))) $errors['status'] = 'Unknown specification status.';
    if (array_key_exists('source_revision', $body) && (!is_string($body['source_revision']) || preg_match('/^P\d{2,}$/i', $body['source_revision']) !== 1)) $errors['source_revision'] = 'Must be a P-prefixed revision token.';
    if (isset($body['image_url']) && filter_var($body['image_url'], FILTER_VALIDATE_URL) === false) $errors['image_url'] = 'Must be an absolute URL.';
    if (isset($body['description']) && (!is_string($body['description']) || mb_strlen($body['description']) > 65535)) $errors['description'] = 'Must be text within 64KiB.';
    if (strlen(json_encode($body, JSON_THROW_ON_ERROR)) > 262144) $errors['payload'] = 'Payload exceeds 256KiB.';
    return $errors;
}
