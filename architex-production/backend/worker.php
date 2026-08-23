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
 * registered handler, and marks the row done/failed. Handlers are stubs
 * until the external AI/speech providers are wired; a stub handler marks the
 * job done with a deterministic placeholder result so the pipeline is
 * testable end-to-end today.
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

/**
 * Job handlers keyed by job_type. Each receives the decoded payload and
 * returns a result array. Real provider integrations replace these stubs.
 */
$handlers = [
    'transcribe_meeting' => function (array $payload): array {
        // Stub: a real handler calls the speech-to-text provider and writes
        // meeting_transcript_segments rows.
        return ['status' => 'stub', 'note' => 'Transcription provider not yet configured', 'meeting_id' => $payload['meeting_id'] ?? null];
    },
    'draft_minutes' => function (array $payload): array {
        return ['status' => 'stub', 'note' => 'LLM minute-drafting provider not yet configured', 'meeting_id' => $payload['meeting_id'] ?? null];
    },
    'ai_drawing_scan' => function (array $payload): array {
        return ['status' => 'stub', 'note' => 'Drawing-intelligence provider not yet configured', 'source_revision_id' => $payload['source_revision_id'] ?? null];
    },
    'ai_feature_brief' => function (array $payload): array {
        return ['status' => 'stub', 'note' => 'Feature-brief synthesis provider not yet configured', 'cluster_id' => $payload['cluster_id'] ?? null];
    },
    'cluster_feedback' => function (array $payload): array {
        return ['status' => 'stub', 'note' => 'Feedback clustering not yet configured'];
    },
];

$claimed = 0;
$processed = 0;
$failed = 0;

$claim = $pdo->prepare("UPDATE jobs SET status = 'processing', attempts = attempts + 1 WHERE id = ? AND status = 'pending'");
$finish = $pdo->prepare('UPDATE jobs SET status = ?, result_json = ?, last_error = ? WHERE id = ?');

$pending = $pdo->query("SELECT id, job_type, payload_json, attempts FROM jobs WHERE status = 'pending' ORDER BY created_at ASC LIMIT $batch")->fetchAll();

foreach ($pending as $job) {
    $claimed++;
    $claim->execute([$job['id']]);
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
    } catch (Throwable $e) {
        $finish->execute(['failed', null, $e->getMessage(), $job['id']]);
        $failed++;
        echo "failed {$job['id']} {$job['job_type']}: {$e->getMessage()}\n";
    }
}

echo "worker: claimed=$claimed processed=$processed failed=$failed\n";
exit($failed > 0 ? 2 : 0);
