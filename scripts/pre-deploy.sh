#!/bin/bash

echo "Clear build folder."
mkdir -p .build
rm -rf .build/*
rm epic-stories.zip

echo "Copy files to build folder."
cp -a server/ shared/ static/ scripts/ tools.js package.json package-lock.json .build/
zip -r epic-stories.zip .build/*
