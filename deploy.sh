#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ROSMS Deploy CLI
# Usage:
#   ./deploy.sh "your commit message"
#   ./deploy.sh "your commit message" --skip-build
#   ./deploy.sh --help
#
# Builds the Next.js app, then pushes to GitHub and deploys to Netlify
# simultaneously, streaming both outputs side-by-side in real time.
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────────────
BOLD="\033[1m"
DIM="\033[2m"
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
CYAN="\033[0;36m"
MAGENTA="\033[0;35m"
NC="\033[0m"

# ── Helpers ───────────────────────────────────────────────────────────────────
log()     { echo -e "${DIM}$(date +%H:%M:%S)${NC}  $*"; }
success() { echo -e "${GREEN}${BOLD}✔${NC}  $*"; }
warn()    { echo -e "${YELLOW}${BOLD}⚠${NC}  $*"; }
error()   { echo -e "${RED}${BOLD}✖${NC}  $*" >&2; }
header()  { echo -e "\n${BOLD}${BLUE}▸ $*${NC}"; }

# ── Usage ─────────────────────────────────────────────────────────────────────
usage() {
  echo -e "${BOLD}ROSMS Deploy${NC} — build, push to GitHub, deploy to Netlify"
  echo ""
  echo -e "${BOLD}Usage:${NC}"
  echo "  ./deploy.sh <commit-message> [options]"
  echo ""
  echo -e "${BOLD}Options:${NC}"
  echo "  --skip-build    Skip 'npm run build' (use existing out/ directory)"
  echo "  --branch <name> Git branch to push to (default: main)"
  echo "  --help          Show this help"
  echo ""
  echo -e "${BOLD}Examples:${NC}"
  echo "  ./deploy.sh \"fix: update member edit page\""
  echo "  ./deploy.sh \"feat: add prayer request form\" --skip-build"
  echo "  ./deploy.sh \"hotfix\" --branch staging"
}

# ── Parse arguments ───────────────────────────────────────────────────────────
COMMIT_MSG=""
SKIP_BUILD=false
BRANCH="main"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help|-h)   usage; exit 0 ;;
    --skip-build) SKIP_BUILD=true; shift ;;
    --branch)    BRANCH="$2"; shift 2 ;;
    -*)          error "Unknown option: $1"; usage; exit 1 ;;
    *)
      if [[ -z "$COMMIT_MSG" ]]; then
        COMMIT_MSG="$1"
      else
        COMMIT_MSG="$COMMIT_MSG $1"
      fi
      shift
      ;;
  esac
done

if [[ -z "$COMMIT_MSG" ]]; then
  error "Commit message is required."
  echo ""
  usage
  exit 1
fi

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
LOG_DIR="$FRONTEND_DIR/.deploy-logs"
GIT_LOG="$LOG_DIR/git.log"
NETLIFY_LOG="$LOG_DIR/netlify.log"

mkdir -p "$LOG_DIR"

# ── Check we're in the right place ────────────────────────────────────────────
if [[ ! -d "$FRONTEND_DIR" ]]; then
  error "frontend/ directory not found. Run this script from the project root."
  exit 1
fi

# ── Print banner ──────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${CYAN}╔════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║     ROSMS  Deploy  CLI             ║${NC}"
echo -e "${BOLD}${CYAN}╚════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${DIM}Commit :${NC} ${BOLD}${COMMIT_MSG}${NC}"
echo -e "  ${DIM}Branch :${NC} ${BOLD}${BRANCH}${NC}"
echo -e "  ${DIM}Build  :${NC} ${BOLD}$([ "$SKIP_BUILD" = true ] && echo "skipped" || echo "yes")${NC}"
echo ""

START_TIME=$SECONDS

# ── Step 1 : Build ────────────────────────────────────────────────────────────
if [[ "$SKIP_BUILD" = false ]]; then
  header "Step 1/3  Building Next.js app"
  cd "$FRONTEND_DIR"
  if npm run build; then
    success "Build complete"
  else
    error "Build failed — aborting deploy."
    exit 1
  fi
else
  header "Step 1/3  Build skipped"
  log "Using existing out/ directory"
  if [[ ! -d "$FRONTEND_DIR/out" ]]; then
    error "out/ directory not found. Cannot skip build — run without --skip-build first."
    exit 1
  fi
fi

# ── Step 2 : Stage & commit ───────────────────────────────────────────────────
header "Step 2/3  Committing to git"
cd "$SCRIPT_DIR"

CHANGED=$(git status --short | wc -l | tr -d ' ')
if [[ "$CHANGED" -eq 0 ]]; then
  warn "No changes to commit. Will still push and deploy existing HEAD."
  SKIP_COMMIT=true
else
  SKIP_COMMIT=false
  log "Staging all changes ($CHANGED files)…"
  git add -A
  git commit -m "$COMMIT_MSG"
  success "Committed: $COMMIT_MSG"
fi

# ── Step 3 : GitHub push + Netlify deploy in parallel ─────────────────────────
header "Step 3/3  Pushing to GitHub and deploying to Netlify simultaneously"
echo ""
echo -e "  ${DIM}Streaming logs below. GitHub ${MAGENTA}[GH]${NC}  Netlify ${YELLOW}[NL]${NC}${NC}"
echo ""

# Clear previous logs
: > "$GIT_LOG"
: > "$NETLIFY_LOG"

# ── GitHub push (background) ──────────────────────────────────────────────────
(
  cd "$SCRIPT_DIR"
  echo "[GH] Pushing to origin/$BRANCH…" >> "$GIT_LOG"
  if git push origin "$BRANCH" >> "$GIT_LOG" 2>&1; then
    echo "[GH] ✔ Push complete" >> "$GIT_LOG"
    echo "GH_OK" >> "$GIT_LOG"
  else
    echo "[GH] ✖ Push failed" >> "$GIT_LOG"
    echo "GH_FAIL" >> "$GIT_LOG"
  fi
) &
GH_PID=$!

# ── Netlify deploy (background) ───────────────────────────────────────────────
(
  cd "$FRONTEND_DIR"
  echo "[NL] Starting Netlify production deploy…" >> "$NETLIFY_LOG"
  if netlify deploy --dir=out --prod >> "$NETLIFY_LOG" 2>&1; then
    echo "NL_OK" >> "$NETLIFY_LOG"
  else
    echo "[NL] ✖ Netlify deploy failed" >> "$NETLIFY_LOG"
    echo "NL_FAIL" >> "$NETLIFY_LOG"
  fi
) &
NL_PID=$!

# ── Stream both log files to terminal ─────────────────────────────────────────
tail_pids=()

(tail -f "$GIT_LOG" 2>/dev/null | while IFS= read -r line; do
  echo -e "  ${MAGENTA}[GH]${NC} $line"
done) &
tail_pids+=($!)

(tail -f "$NETLIFY_LOG" 2>/dev/null | while IFS= read -r line; do
  echo -e "  ${YELLOW}[NL]${NC} $line"
done) &
tail_pids+=($!)

# ── Wait for both jobs ────────────────────────────────────────────────────────
wait $GH_PID;  GH_STATUS=$?
wait $NL_PID;  NL_STATUS=$?

# Give tails a moment to flush, then stop them
sleep 1
for p in "${tail_pids[@]}"; do
  kill "$p" 2>/dev/null || true
done

# ── Parse outcomes ────────────────────────────────────────────────────────────
GH_OK=false;  NL_OK=false
grep -q "GH_OK"  "$GIT_LOG"     2>/dev/null && GH_OK=true
grep -q "NL_OK"  "$NETLIFY_LOG" 2>/dev/null && NL_OK=true

NETLIFY_URL=$(grep -o 'https://[a-z0-9]*--aquamarine-chaja-11dedd\.netlify\.app' "$NETLIFY_LOG" 2>/dev/null | tail -1 || true)
PROD_URL=$(grep -o 'Production URL:.*' "$NETLIFY_LOG" 2>/dev/null | head -1 | sed 's/Production URL: //' | tr -d '<>' || true)

# ── Summary ───────────────────────────────────────────────────────────────────
ELAPSED=$(( SECONDS - START_TIME ))
echo ""
echo -e "${BOLD}${CYAN}══════════════════════════════════════${NC}"
echo -e "${BOLD}  Deploy Summary${NC}"
echo -e "${BOLD}${CYAN}══════════════════════════════════════${NC}"

if $GH_OK; then
  success "GitHub  — pushed to origin/$BRANCH"
else
  error   "GitHub  — push failed (check $GIT_LOG)"
fi

if $NL_OK; then
  success "Netlify — production deploy complete"
  [[ -n "$PROD_URL"    ]] && echo -e "          ${DIM}Live :${NC}   ${CYAN}${PROD_URL}${NC}"
  [[ -n "$NETLIFY_URL" ]] && echo -e "          ${DIM}Deploy:${NC}  ${DIM}${NETLIFY_URL}${NC}"
else
  error   "Netlify — deploy failed (check $NETLIFY_LOG)"
fi

echo ""
echo -e "  ${DIM}Total time: ${ELAPSED}s${NC}"
echo ""

# Exit non-zero if either step failed
if ! $GH_OK || ! $NL_OK; then
  exit 1
fi
