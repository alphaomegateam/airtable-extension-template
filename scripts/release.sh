#!/usr/bin/env bash

# Release script for Airtable Interface Extension
# Combines: npm version bump, git tag, and block release
#
# Usage: npm run release:patch -- "release message"
#        npm run release:minor -- "release message"
#        npm run release:major -- "release message"
#
# If no message is provided, you will be prompted for one.
#
# Commit your work BEFORE running this — the script refuses to run on a dirty
# working tree so that unrelated changes cannot ride along in the release.

set -e

# First argument is version type (passed by npm script)
VERSION_TYPE="${1:-patch}"
shift 2>/dev/null || true

# Remaining arguments are the message
MESSAGE="$*"

# Validate version type
if [[ ! "$VERSION_TYPE" =~ ^(major|minor|patch)$ ]]; then
    echo "Error: Version type must be 'major', 'minor', or 'patch'"
    exit 1
fi

# Prompt for message if not provided
if [ -z "$MESSAGE" ]; then
    echo "Enter commit/release message:"
    read -r MESSAGE
    if [ -z "$MESSAGE" ]; then
        echo "Error: Commit message is required"
        exit 1
    fi
fi

echo "Starting release process..."
echo "  Message: $MESSAGE"
echo "  Version bump: $VERSION_TYPE"
echo ""

# Refuse to release from a dirty working tree.
#
# This step used to `git add -A` and commit everything, which swept unrelated
# changes into the release commit — lockfile churn from a local `npm install`,
# half-finished edits, stray scratch files. Releases are cut from a committed
# state instead; see the Release Flow section of CLAUDE.md.
echo "Checking working tree..."
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo ""
    echo "Error: working tree has uncommitted changes:"
    echo ""
    git status --short -uno | sed 's/^/    /'
    echo ""
    echo "Commit or stash them, then re-run the release."
    exit 1
fi

UNTRACKED="$(git ls-files --others --exclude-standard)"
if [ -n "$UNTRACKED" ]; then
    echo "  Note: untracked files present; they are not part of this release:"
    echo "$UNTRACKED" | sed 's/^/    /'
fi
echo "  Working tree clean."

# Bump version (creates a new commit and tag)
echo "Bumping version ($VERSION_TYPE)..."
npm version "$VERSION_TYPE" -m "$MESSAGE"

# Deploy to Airtable
echo "Deploying to Airtable..."
echo "$MESSAGE" | block release

echo ""
echo "Release complete!"
echo "New version: $(node -p "require('./package.json').version")"
