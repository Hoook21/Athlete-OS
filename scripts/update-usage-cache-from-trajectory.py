#!/usr/bin/env python3
"""
Rebuild/extend the OpenClaw .usage-cost-cache.json from current .trajectory.jsonl
files. This is a pragmatic workaround because OpenClaw's session-cost-usage
module still parses the legacy .jsonl format and ignores the new trajectory
files, so the cache stops growing after the session format changed.
"""
import json
import os
import glob
from pathlib import Path
from datetime import datetime, timezone

SESSIONS_DIR = Path.home() / ".openclaw/agents/main/sessions"
CACHE_PATH = SESSIONS_DIR / ".usage-cost-cache.json"


def now_ms():
    return int(datetime.now(timezone.utc).timestamp() * 1000)


def extract_usage_from_trajectory(path: Path):
    """Yield usage entries from a .trajectory.jsonl file."""
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue
            if entry.get("type") != "model.completed":
                continue
            data = entry.get("data", {})
            usage = data.get("usage")
            if not usage or not isinstance(usage, dict):
                continue
            ts_str = entry.get("ts") or data.get("ts")
            ts = None
            if ts_str:
                try:
                    ts = int(datetime.fromisoformat(ts_str.replace("Z", "+00:00")).timestamp() * 1000)
                except Exception:
                    pass
            if ts is None:
                ts = now_ms()
            provider = entry.get("provider", "unknown")
            model = entry.get("modelId", entry.get("model", "unknown"))
            inp = int(usage.get("input", 0) or 0)
            out = int(usage.get("output", 0) or 0)
            cache_read = int(usage.get("cacheRead", 0) or 0)
            cache_write = int(usage.get("cacheWrite", 0) or 0)
            total_tokens = inp + out + cache_read + cache_write
            # No cost data available for most providers; mirror the legacy
            # behaviour of marking cost as zero when no pricing is present.
            yield {
                "timestamp": ts,
                "provider": provider,
                "model": model,
                "input": inp,
                "output": out,
                "cacheRead": cache_read,
                "cacheWrite": cache_write,
                "totalTokens": total_tokens,
                "totalCost": 0,
                "inputCost": 0,
                "outputCost": 0,
                "cacheReadCost": 0,
                "cacheWriteCost": 0,
                "missingCostEntries": 1 if total_tokens > 0 else 0,
            }


def build_file_entry(path: Path):
    stat = path.stat()
    entries = list(extract_usage_from_trajectory(path))
    totals = {
        "input": 0,
        "output": 0,
        "cacheRead": 0,
        "cacheWrite": 0,
        "totalTokens": 0,
        "totalCost": 0,
        "inputCost": 0,
        "outputCost": 0,
        "cacheReadCost": 0,
        "cacheWriteCost": 0,
        "missingCostEntries": 0,
    }
    for e in entries:
        for k in totals:
            totals[k] += e.get(k, 0)
    return {
        "filePath": str(path),
        "size": stat.st_size,
        "mtimeMs": stat.st_mtime * 1000,
        "pricingFingerprint": "{}",
        "scannedAt": now_ms(),
        "parsedRecords": len(entries),
        "countedRecords": len(entries),
        "usageEntries": entries,
        "totals": totals,
    }


def main():
    if CACHE_PATH.exists():
        cache = json.loads(CACHE_PATH.read_text(encoding="utf-8"))
    else:
        cache = {"version": 4, "updatedAt": 0, "files": {}}

    cache.setdefault("files", {})
    cache["version"] = 4

    trajectories = sorted(SESSIONS_DIR.glob("*.trajectory.jsonl"))
    print(f"Found {len(trajectories)} trajectory files")

    updated = 0
    added = 0
    skipped = 0
    for path in trajectories:
        key = str(path)
        stat = path.stat()
        existing = cache["files"].get(key)
        if existing and abs(existing.get("mtimeMs", 0) - stat.st_mtime * 1000) < 1:
            skipped += 1
            continue
        file_entry = build_file_entry(path)
        if file_entry["parsedRecords"] == 0 and existing:
            # Keep existing data if the new parse yields nothing useful.
            skipped += 1
            continue
        cache["files"][key] = file_entry
        if existing:
            updated += 1
        else:
            added += 1

    cache["updatedAt"] = now_ms()
    CACHE_PATH.write_text(json.dumps(cache, indent=2, default=str), encoding="utf-8")
    print(f"Cache saved: {len(cache['files'])} files, {added} added, {updated} updated, {skipped} skipped")


if __name__ == "__main__":
    main()
