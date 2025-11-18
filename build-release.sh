#!/bin/bash

echo "===================================="
echo "Building Docfast Toolkit for Release"
echo "===================================="
echo ""

echo "[1/4] Compiling SCSS to CSS..."
npx sass sass:css
if [ $? -ne 0 ]; then
    echo "ERROR: SCSS compilation failed"
    exit 1
fi
echo "✓ CSS compiled successfully"
echo ""

echo "[2/4] Building JavaScript bundles with Webpack..."
npx webpack --config webpack.config.js
if [ $? -ne 0 ]; then
    echo "ERROR: Webpack build failed"
    exit 1
fi
echo "✓ JavaScript bundles built successfully"
echo ""

echo "[3/4] Copying compiled files to chrome folder..."
cp css/*.css chrome/css/
cp css/*.css.map chrome/css/
cp manifests/manifest-chrome.json chrome/manifest.json
cp manifests/schema-chrome.json chrome/schema.json
echo "✓ Files copied to chrome folder"
echo ""

echo "[4/4] Updating release folder..."
cp -r chrome/dist/* release/dist/
cp -r chrome/css/* release/css/
cp chrome/manifest.json release/
cp -r chrome/_locales/* release/_locales/
cp -r chrome/images/* release/images/
cp -r chrome/view/* release/view/
cp chrome/LICENSE release/
cp chrome/schema.json release/
echo "✓ Release folder updated successfully"
echo ""

echo "===================================="
echo "Build completed successfully!"
echo "Release folder is ready at: release/"
echo "===================================="
