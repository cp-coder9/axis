#!/usr/bin/env python3
"""Atomically mount the Phase 0 PHP containment API beside the legacy gateway."""
from ftplib import FTP, FTP_TLS
from pathlib import Path, PurePosixPath
import json
import os
import sys


def required(name: str) -> str:
    value = os.environ.get(name, '').strip()
    if not value:
        raise RuntimeError(f'Missing required environment variable {name}')
    return value


server = required('TEST_ARCHITEX_FTP_SERVER')
username = required('TEST_ARCHITEX_FTP_USERNAME')
password = required('TEST_ARCHITEX_FTP_PASSWORD')
base = PurePosixPath('/' + required('TEST_ARCHITEX_API_FTP_SERVER_DIR').strip('/'))
local = Path(sys.argv[1] if len(sys.argv) > 1 else 'release/phase0-api').resolve()
info = json.loads((local / 'phase0-deploy-info.json').read_text(encoding='utf-8'))
suffix = info['revision'][:12]
upload_name = f'.phase0-backend-upload-{suffix}'
active_name = 'phase0-backend'
prior_name = f'.phase0-backend-prior-{suffix}'
router_backup = f'.htaccess.pre-phase0-{suffix}'
use_tls = os.environ.get('TEST_ARCHITEX_FTP_TLS', '1') != '0'
ftp = FTP_TLS(timeout=45) if use_tls else FTP(timeout=45)


def remote(path: str) -> str:
    return str(base / path)


def names(path: str) -> set[str]:
    return {name for name, facts in ftp.mlsd(path)}


def ensure_dir(path: str) -> None:
    current = PurePosixPath('/')
    for part in PurePosixPath(path).parts[1:]:
        current /= part
        try:
            ftp.mkd(str(current))
        except Exception:
            pass


def upload_tree(source: Path, destination: str) -> None:
    ensure_dir(destination)
    for item in source.iterdir():
        target = f'{destination}/{item.name}'
        if item.is_dir():
            upload_tree(item, target)
        else:
            with item.open('rb') as handle:
                ftp.storbinary(f'STOR {target}', handle)


swapped_router = False
activated = False
try:
    ftp.connect(server, 21)
    ftp.login(username, password)
    if use_tls:
        ftp.prot_p()
    existing = names(str(base))
    if '.htaccess' not in existing or 'index.php' not in existing:
        raise RuntimeError('API document root verification failed closed')
    for target in (upload_name, prior_name, router_backup):
        if target in existing:
            raise RuntimeError(f'Remote safety target already exists: {target}')
    upload_tree(local / 'phase0-backend', remote(upload_name))
    uploaded = names(remote(upload_name))
    required_entries = {'public', 'generated', 'lib', 'data', 'config.php'}
    if not required_entries.issubset(uploaded):
        raise RuntimeError(f'Incomplete candidate upload: {sorted(required_entries - uploaded)}')
    if active_name in existing:
        ftp.rename(remote(active_name), remote(prior_name))
    ftp.rename(remote(upload_name), remote(active_name))
    activated = True
    ftp.rename(remote('.htaccess'), remote(router_backup))
    swapped_router = True
    with (local / '.htaccess').open('rb') as handle:
        ftp.storbinary(f'STOR {remote(".htaccess")}', handle)
    with (local / 'phase0-deploy-info.json').open('rb') as handle:
        ftp.storbinary(f'STOR {remote("phase0-deploy-info.json")}', handle)
    final = names(str(base))
    if not {'.htaccess', active_name, 'phase0-deploy-info.json'}.issubset(final):
        raise RuntimeError('Post-deployment structural verification failed')
    print(json.dumps({
        'deployed': True,
        'revision': info['revision'],
        'manifestSha256': info['manifestSha256'],
        'target': str(base),
        'routerBackup': router_backup,
        'priorCandidate': prior_name if active_name in existing else None,
    }))
except Exception:
    if swapped_router:
        try:
            ftp.delete(remote('.htaccess'))
            ftp.rename(remote(router_backup), remote('.htaccess'))
        except Exception as rollback_error:
            print(f'ROUTER ROLLBACK FAILED: {rollback_error}', file=sys.stderr)
    if activated and active_name in locals():
        print('Phase 0 router was restored; uploaded candidate remains inert for inspection.', file=sys.stderr)
    raise
finally:
    try:
        ftp.quit()
    except Exception:
        ftp.close()
