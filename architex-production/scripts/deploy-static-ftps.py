#!/usr/bin/env python3
"""Atomically deploy a static export over explicit FTPS with a sibling rollback."""

from __future__ import annotations

import json
import os
import posixpath
import sys
import time
from datetime import datetime, timezone
from ftplib import FTP_TLS
from pathlib import Path


HOST = "ftp.architex.co.za"
TARGET = "/public_html/architex.co.za/ai/public_html/test.architex.co.za"
REQUIRED = {".htaccess", "index.html", "preview3.html", "_next"}


def remote_entries(ftp: FTP_TLS, path: str) -> set[str]:
    current = ftp.pwd()
    try:
        ftp.cwd(path)
        return {name for name, _ in ftp.mlsd() if name not in {".", ".."}}
    finally:
        ftp.cwd(current)


def ensure_remote_dir(ftp: FTP_TLS, path: str) -> None:
    parts = [part for part in path.split("/") if part]
    ftp.cwd("/")
    for part in parts:
        try:
            ftp.cwd(part)
        except Exception:
            ftp.mkd(part)
            ftp.cwd(part)


def connect(user: str, password: str) -> FTP_TLS:
    ftp = FTP_TLS(HOST, timeout=60)
    ftp.login(user, password)
    ftp.prot_p()
    return ftp


def upload_tree(user: str, password: str, local_root: Path, remote_root: str) -> tuple[int, int]:
    count = 0
    total = 0
    files = sorted(path for path in local_root.rglob("*") if path.is_file())
    for offset in range(0, len(files), 5):
        batch = files[offset : offset + 5]
        for attempt in range(1, 4):
            ftp = connect(user, password)
            try:
                for local_path in batch:
                    relative = local_path.relative_to(local_root).as_posix()
                    remote_path = posixpath.join(remote_root, relative)
                    ensure_remote_dir(ftp, posixpath.dirname(remote_path))
                    with local_path.open("rb") as handle:
                        ftp.storbinary(f"STOR {posixpath.basename(remote_path)}", handle)
                ftp.quit()
                break
            except Exception:
                ftp.close()
                if attempt == 3:
                    raise
                time.sleep(attempt)
        count += len(batch)
        total += sum(path.stat().st_size for path in batch)
    return count, total


def main() -> int:
    local_root = Path(sys.argv[1] if len(sys.argv) > 1 else "out").resolve()
    if not local_root.is_dir():
        raise RuntimeError(f"Static export not found: {local_root}")
    local_entries = {path.name for path in local_root.iterdir()}
    if not REQUIRED.issubset(local_entries):
        raise RuntimeError(f"Static export missing: {sorted(REQUIRED - local_entries)}")

    user = os.environ["ARCHITEX_FTP_USER"]
    password = os.environ["ARCHITEX_FTP_PASSWORD"]
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    parent, name = posixpath.split(TARGET)
    candidate_name = os.environ.get("ARCHITEX_DEPLOY_CANDIDATE", f"{name}.candidate-v8-datum-{stamp}")
    if not candidate_name.startswith(f"{name}.candidate-v8-datum-") or "/" in candidate_name:
        raise RuntimeError("Invalid candidate name")
    rollback_name = f"{name}.pre-v8-datum-{stamp}"
    candidate = posixpath.join(parent, candidate_name)
    rollback = posixpath.join(parent, rollback_name)

    ftp = connect(user, password)
    try:
        existing = remote_entries(ftp, TARGET)
        if not REQUIRED.issubset(existing):
            raise RuntimeError(f"Refusing swap: live target missing {sorted(REQUIRED - existing)}")
        ftp.cwd(parent)
        parent_entries = remote_entries(ftp, parent)
        if rollback_name in parent_entries:
            raise RuntimeError("Unique rollback path already exists")
        if candidate_name not in parent_entries:
            ftp.mkd(candidate_name)
        ftp.quit()
        uploaded_files, uploaded_bytes = upload_tree(user, password, local_root, candidate)
        ftp = connect(user, password)
        candidate_entries = remote_entries(ftp, candidate)
        if not REQUIRED.issubset(candidate_entries):
            raise RuntimeError(f"Candidate missing {sorted(REQUIRED - candidate_entries)}")
        local_files = sum(1 for path in local_root.rglob("*") if path.is_file())
        if uploaded_files != local_files:
            raise RuntimeError(f"Candidate file count mismatch: {uploaded_files} != {local_files}")

        ftp.cwd(parent)
        ftp.rename(name, rollback_name)
        try:
            ftp.rename(candidate_name, name)
        except Exception:
            ftp.rename(rollback_name, name)
            raise

        deployed = remote_entries(ftp, TARGET)
        if not REQUIRED.issubset(deployed):
            raise RuntimeError("Post-swap structural verification failed")
        print(json.dumps({
            "deployed": True,
            "target": TARGET,
            "rollback": rollback,
            "uploadedFiles": uploaded_files,
            "uploadedBytes": uploaded_bytes,
            "timestampUtc": stamp,
        }))
    finally:
        try:
            ftp.quit()
        except Exception:
            ftp.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
