<?php
/**
 * Architex OS — cron-polled background job worker (PRD §10.3).
 *
 * Shared hosting has no persistent worker process, so async work
 * (transcription, AI minute drafting, drawing-takeoff extraction, feedback
 * clustering, feature-brief generation) is modelled as rows in the `jobs`
 * table and processed by this script, triggered by a cron job every 1-2
 * minutes:
 *
 *     *\/2 * * * *  php /path/to/backend/worker.php >> /path/to/worker.log 2>&1
 *
 * Each run claims up to --batch pending jobs (default 5), executes the
 * registered handler, and records the real terminal state. Unconfigured
 * integrations remain visible as `integration_required`; they are never
 * reported as completed.
 *
 * Usage:  php backend/worker.php [--batch=N] [--once]
 */
declare(strict_types=1);

$config = require __DIR__ . '/config.php';
$db = $config['database'];

try {
    $pdo = new PDO(
        sprintf('mysql:host=%s;dbname=%s;charset=%s', $db['host'], $db['name'], $db['charset']),
        $db['user'],
        $db['pass'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    fwrite(STDERR, "worker: cannot connect to database: {$e->getMessage()}\n");
    exit(1);
}

$opts = getopt('', ['batch::', 'once']);
$batch = max(1, min(50, (int)($opts['batch'] ?? 5)));

final class IntegrationRequired extends RuntimeException {}

/** @return Closure(array):array */
function integration_handler(string $label, string $environmentVariable): Closure
{
    return static function (array $payload) use ($label, $environmentVariable): array {
        if (trim((string) getenv($environmentVariable)) === '') {
            throw new IntegrationRequired("{$label} integration is not configured; set {$environmentVariable} before retrying.");
        }
        throw new RuntimeException("{$label} integration is configured but its adapter is not available in this release.");
    };
}

/** Job handlers keyed by job_type. */
$handlers = [
    'transcribe_meeting' => function (array $payload): array {
        // Stub: a real handler calls the speech-to-text provider and writes
        // meeting_transcript_segments rows.
        return ['status' => 'stub', 'note' => 'Transcription provider not yet configured', 'meeting_id' => $payload['meeting_id'] ?? null];
    },
    'draft_minutes' => function (array $payload): array {
        return ['status' => 'stub', 'note' => 'LLM minute-drafting provider not yet configured', 'meeting_id' => $payload['meeting_id'] ?? null];
    },
    'ai_drawing_scan' => integration_handler('Drawing intelligence', 'ARCHITEX_DRAWING_INTELLIGENCE_ENDPOINT'),
    'ai_feature_brief' => function (array $payload): array {
        return ['status' => 'stub', 'note' => 'Feature-brief synthesis provider not yet configured', 'cluster_id' => $payload['cluster_id'] ?? null];
    },
    'cluster_feedback' => function (array $payload): array {
        return ['status' => 'stub', 'note' => 'Feedback clustering not yet configured'];
    },
    'specforge.action-centre' => integration_handler('Action Centre', 'ARCHITEX_ACTION_CENTRE_ENDPOINT'),
    'specforge.messaging' => integration_handler('Messaging', 'ARCHITEX_MESSAGING_ENDPOINT'),
    'specforge.programme' => integration_handler('Programme', 'ARCHITEX_PROGRAMME_ENDPOINT'),
    'specforge.bom-sync' => integration_handler('BoM sync', 'ARCHITEX_BOM_ENDPOINT'),
    'specforge.rfq' => integration_handler('RFQ', 'ARCHITEX_RFQ_ENDPOINT'),
    'specforge.document' => integration_handler('Document generation', 'ARCHITEX_DOCUMENT_ENDPOINT'),
    'specforge.escrow' => integration_handler('Escrow', 'ARCHITEX_ESCROW_ENDPOINT'),
];

$claimed = 0;
$processed = 0;
$failed = 0;
$integrationRequired = 0;

$claim = $pdo->prepare("UPDATE jobs SET status = 'processing', attempts = attempts + 1 WHERE id = ? AND status = 'pending'");
$finish = $pdo->prepare('UPDATE jobs SET status = ?, result_json = ?, last_error = ? WHERE id = ?');

$pending = $pdo->query("SELECT id, job_type, payload_json, attempts FROM jobs WHERE status = 'pending' ORDER BY created_at ASC LIMIT $batch")->fetchAll();

foreach ($pending as $job) {
    $claimed++;
    $claim->execute([$job['id']]);
    if ($claim->rowCount() !== 1) continue;
    $payload = json_decode((string)$job['payload_json'], true) ?? [];
    $handler = $handlers[$job['job_type']] ?? null;
    try {
        if ($handler === null) {
            throw new RuntimeException("No handler registered for job_type '{$job['job_type']}'");
        }
        $result = $handler($payload);
        $finish->execute(['done', json_encode($result, JSON_UNESCAPED_SLASHES), null, $job['id']]);
        $processed++;
        echo "done   {$job['id']} {$job['job_type']}\n";
    } catch (IntegrationRequired $e) {
        $finish->execute(['integration_required', null, $e->getMessage(), $job['id']]);
        $integrationRequired++;
        echo "waiting {$job['id']} {$job['job_type']}: {$e->getMessage()}\n";
    } catch (Throwable $e) {
        $finish->execute(['failed', null, $e->getMessage(), $job['id']]);
        $failed++;
        echo "failed {$job['id']} {$job['job_type']}: {$e->getMessage()}\n";
    }
}

echo "worker: claimed=$claimed processed=$processed integration_required=$integrationRequired failed=$failed\n";
exit($failed > 0 ? 2 : 0);
