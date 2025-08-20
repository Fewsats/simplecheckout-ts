#!/bin/sh
set -e

# Get the version argument passed to the script
VERSION_ARG=$1

# Check if an argument was provided
if [ -z "$VERSION_ARG" ]; then
  echo "Error: No release type or version specified."
  echo "Usage: npm run release <patch|minor|major|version>"
  exit 1
fi

echo "Starting release for version: $VERSION_ARG"

# Run npm version with the provided argument
npm version "$VERSION_ARG"

# Push the new commit and tag
git push && git push --tags

echo "✅ Release process initiated. The GitHub Action will now take over."
