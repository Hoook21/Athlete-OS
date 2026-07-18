#!/bin/zsh
# Daily refresh of Hook Cockpit usage cache from OpenClaw trajectory files.
set -euo pipefail

SCRIPT_DIR="${0:A:h}"
MAC_USER="hook"
MAC_CACHE="/Users/${MAC_USER}/.openclaw/agents/main/sessions/.usage-cost-cache.json"
VM_CACHE="/home/hook/.openclaw/agents/main/sessions/.usage-cost-cache.json"
COCKPIT_URL="http://100.117.104.116:5175"
SSH_KEY="/Users/${MAC_USER}/.ssh/id_ed25519"
VM_USER="hook"
VM_HOST="100.117.104.116"
SSH_OPTS=(-i "${SSH_KEY}" -o BatchMode=yes -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null)

echo "[$(date -Iseconds)] Starting usage cache refresh"

# 1. Rebuild cache from trajectory files on the Mac
/usr/local/bin/python3 "${SCRIPT_DIR}/update-usage-cache-from-trajectory.py"

# 2. Ensure directory exists on VM and sync cache via ssh+cat
/usr/bin/ssh "${SSH_OPTS[@]}" "${VM_USER}@${VM_HOST}" "mkdir -p /home/hook/.openclaw/agents/main/sessions"
/usr/bin/ssh "${SSH_OPTS[@]}" "${VM_USER}@${VM_HOST}" "cat > ${VM_CACHE}" < "${MAC_CACHE}"

# 3. Tell Cockpit to regenerate its state from the fresh cache
/usr/bin/curl -s -m 30 "${COCKPIT_URL}/api/refresh" > /dev/null

echo "[$(date -Iseconds)] Usage cache refresh done"
