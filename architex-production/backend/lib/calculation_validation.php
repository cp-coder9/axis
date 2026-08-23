<?php
declare(strict_types=1);

const ENGINEERING_CALCULATOR_IDS = ['steel-beam','concrete-beam','timber-beam','geo-bearing','wind-load','stormwater-rational','duct-sizing','heat-gain','travel-distance','fire-resistance','fire-water','cable-sizing','max-demand','cold-water','drainage-fu','geyser-sizing','unit-converter'];
const ENGINEERING_UNIT_CODES = ['m','mm','m2','mm2','ha','m3','L','kN','N','kN/m','N/mm','Pa','kPa','MPa','m/s','L/s','L/min','m3/s','W','kW','kWh','K','A','V','mOhm/m','min','%','FU','1'];

/** @return array<string,string> */
function validate_engineering_payload(array $body): array
{
    $errors = [];
    $allowed = ['project_id','calc_type','schemaVersion','calculatorId','formulaVersion','inputs','results','derivation','references','assumptions','limitations','linked_drawing_ref','linked_meeting_id','linked_rfi_id'];
    foreach (array_keys($body) as $key) if (!in_array($key, $allowed, true)) $errors[$key] = 'Unexpected field.';
    if (($body['schemaVersion'] ?? null) !== 'engineering-calculation/v1') $errors['schemaVersion'] = 'Must equal engineering-calculation/v1.';
    if (!is_string($body['calc_type'] ?? null) || !in_array($body['calc_type'], ENGINEERING_CALCULATOR_IDS, true)) $errors['calc_type'] = 'Unknown calculator type.';
    if (($body['calculatorId'] ?? null) !== ($body['calc_type'] ?? null)) $errors['calculatorId'] = 'Must match calc_type.';
    if (!is_string($body['formulaVersion'] ?? null) || $body['formulaVersion'] === '') $errors['formulaVersion'] = 'Required.';
    if (!array_key_exists('project_id', $body) || (!is_string($body['project_id']) && $body['project_id'] !== null) || $body['project_id'] === '') $errors['project_id'] = 'Required as a project ID or null.';
    if (!is_array($body['inputs'] ?? null) || count($body['inputs']) < 1 || count($body['inputs']) > 100) $errors['inputs'] = 'Must contain 1 to 100 quantities.';
    else foreach ($body['inputs'] as $key => $quantity) {
        if (!is_string($key) || !is_array($quantity) || array_keys($quantity) !== ['value','unit'] || !is_numeric($quantity['value'] ?? null) || !is_finite((float)$quantity['value']) || !is_string($quantity['unit'] ?? null) || !in_array($quantity['unit'], ENGINEERING_UNIT_CODES, true)) $errors['inputs.' . $key] = 'Must be a finite {value,unit} quantity.';
    }
    if (!is_array($body['results'] ?? null) || count($body['results']) < 1) $errors['results'] = 'Must be a non-empty result array.';
    else foreach ($body['results'] as $index => $result) {
        if (!is_array($result) || !is_string($result['key'] ?? null) || !is_string($result['label'] ?? null) || !is_array($result['quantity'] ?? null) || array_keys($result['quantity']) !== ['value','unit'] || !is_numeric($result['quantity']['value'] ?? null) || !is_finite((float)$result['quantity']['value']) || !in_array($result['quantity']['unit'] ?? null, ENGINEERING_UNIT_CODES, true) || !array_key_exists('passes', $result) || !($result['passes'] === null || is_bool($result['passes'])) || !array_key_exists('criterion', $result) || !($result['criterion'] === null || is_string($result['criterion']))) $errors['results.' . $index] = 'Must be a structured calculation result.';
    }
    foreach (['derivation','assumptions','limitations'] as $field) {
        if (!is_array($body[$field] ?? null) || array_filter($body[$field], fn ($value) => !is_string($value)) || strlen(json_encode($body[$field], JSON_THROW_ON_ERROR)) > 65536) $errors[$field] = 'Must be a string array within 64KiB.';
    }
    if (!is_array($body['references'] ?? null)) $errors['references'] = 'Must be a structured reference array.';
    else foreach ($body['references'] as $index => $reference) if (!is_array($reference) || !is_string($reference['id'] ?? null) || !is_string($reference['title'] ?? null) || !is_string($reference['edition'] ?? null) || !array_key_exists('clause', $reference) || !($reference['clause'] === null || is_string($reference['clause'])) || !array_key_exists('url', $reference) || !($reference['url'] === null || is_string($reference['url']))) $errors['references.' . $index] = 'Must be a structured reference.';
    if (strlen(json_encode($body, JSON_THROW_ON_ERROR)) > 262144) $errors['payload'] = 'Payload exceeds 256KiB.';
    return $errors;
}
