#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
workflow_path="$repo_root/.github/workflows/ci.yml"
job_name="${ACT_JOB:-verify}"
event_name="${ACT_EVENT:-push}"

if ! command -v act >/dev/null 2>&1; then
  echo "Error: 'act' is not installed. Install it with your package manager." >&2
  exit 1
fi

exec act "$event_name" -W "$workflow_path" -j "$job_name" "$@"
