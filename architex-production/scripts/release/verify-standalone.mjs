import { spawn, spawnSync } from 'node:child_process';
import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { once } from 'node:events';
import { resolve } from 'node:path';

const root = resolve('.');
const port = Number(process.env.ARCHITEX_RELEASE_VERIFY_PORT ?? 3101);
const serverPath = resolve(root, '.next/standalone/server.js');
const origin = `http://127.0.0.1:${port}`;

await access(serverPath, constants.R_OK).catch(() => {
  throw new Error(`Standalone verification missing server.js: ${serverPath}`);
});

const child = spawn(process.execPath, [serverPath], {
  cwd: resolve(root, '.next/standalone'),
  env: { ...process.env, NODE_ENV: 'production', HOSTNAME: '127.0.0.1', PORT: String(port) },
  stdio: 'ignore',
  windowsHide: true,
});

async function stopServer() {
  if (child.exitCode !== null) return;

  if (process.platform === 'win32') {
    const result = spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
      stdio: 'ignore',
      windowsHide: true,
    });
    if (result.status !== 0) {
      throw new Error(`Could not terminate standalone server process tree (PID ${child.pid})`);
    }
  } else {
    child.kill('SIGTERM');
  }

  await Promise.race([
    once(child, 'exit'),
    new Promise((resolveDelay) => setTimeout(resolveDelay, 5_000)),
  ]);
  if (child.exitCode === null) {
    throw new Error('Standalone server did not terminate during cleanup');
  }
}

try {
  let ready = false;
  let lastError = 'not ready';
  for (let attempt = 0; attempt < 40; attempt++) {
    if (child.exitCode !== null) throw new Error(`Standalone server exited early with code ${child.exitCode}`);
    try {
      const response = await fetch(`${origin}/`, { signal: AbortSignal.timeout(1_000) });
      if (response.ok) {
        console.log(`Standalone release verification passed: ${origin} returned ${response.status}`);
        ready = true;
        break;
      }
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
  }
  if (!ready) throw new Error(`Standalone server did not become ready: ${lastError}`);
} finally {
  await stopServer();
}
