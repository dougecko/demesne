#!/bin/bash

# Exit on error
set -e

# Build the API
echo "Building API..."
npm run build

# Create Lambda deployment packages
echo "Creating Lambda deployment packages..."

# Prepare spells Lambda
echo "Preparing spells Lambda..."
mkdir -p dist/spells
cp dist/spellService.mjs dist/spells/index.mjs
cp package.json dist/spells/
cd dist/spells
npm install --production
cd ../..

# Prepare creatures Lambda
echo "Preparing creatures Lambda..."
mkdir -p dist/creatures
cp dist/creatureService.mjs dist/creatures/index.mjs
cp package.json dist/creatures/
cd dist/creatures
npm install --production
cd ../..

echo "Lambda preparation complete!" 