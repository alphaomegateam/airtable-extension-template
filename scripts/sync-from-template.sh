#!/usr/bin/env bash

# Sync template-owned files from the upstream extension template.
#
# Usage: ./scripts/sync-from-template.sh [--check]
#
#   (no args)  apply upstream versions to the working tree
#   --check    report drift and exit 1 if any; change nothing
#
# Extensions are created by copying this template, then `git init` — they share
# no git ancestry with it, so upstream changes cannot be merged in. This script
# copies a fixed set of template-owned paths instead.
#
# SYNCED paths are owned by the template; local edits to them are overwritten.
# Everything else — CLAUDE.md, .gitignore, frontend/, package.json, block.json —
# is per-project and never touched. To change a synced file, change it in the
# template and re-run this everywhere.

set -euo pipefail

TEMPLATE_REPO="https://github.com/alphaomegateam/airtable-extension-template.git"

# Template-owned paths. Directories are synced recursively.
SYNCED_PATHS=(
    ".claude/rules"
    "scripts/release.sh"
    "scripts/sync-from-template.sh"
    "eslint.config.mjs"
    "tsconfig.json"
    "tailwind.config.js"
)

CHECK_ONLY=false
[ "${1:-}" = "--check" ] && CHECK_ONLY=true

if [ ! -d .git ]; then
    echo "Error: run this from the root of an extension repo." >&2
    exit 1
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "Fetching template..."
git clone --depth 1 --quiet "$TEMPLATE_REPO" "$TMP/template"
UPSTREAM_SHA="$(git -C "$TMP/template" rev-parse --short HEAD)"
echo "  at $UPSTREAM_SHA"
echo ""

drift=()

# Compare one file; record it if it differs or is missing locally.
compare_file() {
    local rel="$1"
    local src="$TMP/template/$rel"
    [ -f "$src" ] || return 0
    if [ ! -f "$rel" ]; then
        drift+=("$rel (missing locally)")
    elif ! cmp -s "$src" "$rel"; then
        drift+=("$rel (differs)")
    fi
}

for path in "${SYNCED_PATHS[@]}"; do
    if [ -d "$TMP/template/$path" ]; then
        while IFS= read -r f; do
            compare_file "${f#"$TMP/template/"}"
        done < <(find "$TMP/template/$path" -type f)
    else
        compare_file "$path"
    fi
done

if [ ${#drift[@]} -eq 0 ]; then
    echo "Up to date with the template."
    exit 0
fi

echo "Drift from template ($UPSTREAM_SHA):"
printf '    %s\n' "${drift[@]}"
echo ""

if [ "$CHECK_ONLY" = true ]; then
    echo "Run without --check to apply."
    exit 1
fi

for path in "${SYNCED_PATHS[@]}"; do
    src="$TMP/template/$path"
    [ -e "$src" ] || continue
    if [ -d "$src" ]; then
        mkdir -p "$path"
        cp -R "$src/." "$path/"
    else
        mkdir -p "$(dirname "$path")"
        cp "$src" "$path"
    fi
done
chmod +x scripts/*.sh 2>/dev/null || true

echo "Applied. Review with \`git diff\` and commit."
