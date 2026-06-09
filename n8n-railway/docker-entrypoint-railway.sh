#!/bin/sh
set -e

if [ -n "${PORT:-}" ]; then
  export N8N_PORT="$PORT"
fi

exec /docker-entrypoint.sh "$@"