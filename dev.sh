#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

PYTHON_BIN="$ROOT_DIR/venv/bin/python3"
WATCHMEDO_BIN="$ROOT_DIR/venv/bin/watchmedo"

if [[ ! -x "$PYTHON_BIN" ]]; then
  echo "Missing Python virtualenv at ./venv."
  echo "Create it and install builder dependencies first."
  exit 1
fi

if [[ ! -x "$WATCHMEDO_BIN" ]]; then
  echo "watchdog is not installed in ./venv."
  echo "Run: ./venv/bin/pip install watchdog"
  exit 1
fi

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required but was not found."
  echo "Install Node.js (which includes npm/npx)."
  exit 1
fi

cleanup() {
  local exit_code=$?
  trap - EXIT INT TERM
  if [[ -n "${WATCH_PID:-}" ]] && kill -0 "$WATCH_PID" 2>/dev/null; then
    kill "$WATCH_PID" 2>/dev/null || true
  fi
  if [[ -n "${BS_PID:-}" ]] && kill -0 "$BS_PID" 2>/dev/null; then
    kill "$BS_PID" 2>/dev/null || true
  fi
  if [[ -n "${WATCH_TMP_DIR:-}" ]] && [[ -d "${WATCH_TMP_DIR}" ]]; then
    rm -rf "${WATCH_TMP_DIR}" 2>/dev/null || true
  fi
  wait 2>/dev/null || true
  exit "$exit_code"
}

trap cleanup EXIT INT TERM

# markdown-katex may fallback to npx; provide a deterministic "katex" shim.
WATCH_TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/ak1089-dev.XXXXXX")"
export TMPDIR="$WATCH_TMP_DIR"
DEV_BIN_DIR="$WATCH_TMP_DIR/bin"
mkdir -p "$DEV_BIN_DIR"
cat > "$DEV_BIN_DIR/katex" <<'EOF'
#!/usr/bin/env bash
exec npx --yes katex@0.16.22 "$@"
EOF
chmod +x "$DEV_BIN_DIR/katex"
export PATH="$DEV_BIN_DIR:$PATH"

echo "Initial build..."
"$PYTHON_BIN" builder/build.py

echo "Starting markdown watcher..."
"$WATCHMEDO_BIN" shell-command \
  --recursive \
  --wait \
  --patterns="*.md;*.py;*.html;*.css" \
  --ignore-patterns="*/.git/*;*/node_modules/*;*/venv/*;*/__pycache__/*" \
  --command='
case "${watch_src_path}" in
  *.md)
    ./venv/bin/python3 builder/build.py "${watch_src_path}"
    ;;
  */builder/*|*/assets/templates/*)
    ./venv/bin/python3 builder/build.py
    ;;
  */map/*)
    ./venv/bin/python3 map/generate.py
    ;;
esac
' . &
WATCH_PID=$!

echo "Starting BrowserSync on http://localhost:8000 ..."
npx --yes browser-sync@3.0.3 start \
  --server \
  --port 8000 \
  --files "**/*.html,styles/**/*.css,**/*.js" \
  --no-open &
BS_PID=$!

wait "$WATCH_PID" "$BS_PID"
