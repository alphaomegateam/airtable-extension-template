#!/usr/bin/env bash

# Release script for Airtable Interface Extension
# Combines: git commit, npm version bump, and block release
#
# Usage: npm run release:patch -- "commit message"
#        npm run release:minor -- "commit message"
#        npm run release:major -- "commit message"
#
# If no message is provided, you will be prompted for one.

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

# Stage all changes
echo "Staging changes..."
git add -A

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "No changes to commit. Proceeding with version bump and release..."
else
    # Commit changes
    echo "Committing changes..."
    git commit -m "$MESSAGE"
fi

# Bump version (creates a new commit and tag)
echo "Bumping version ($VERSION_TYPE)..."
npm version "$VERSION_TYPE" -m "$MESSAGE"

# Deploy to Airtable
echo "Deploying to Airtable..."
echo "$MESSAGE" | block release

echo ""
echo "Release complete!"
echo "New version: $(node -p "require('./package.json').version")"
