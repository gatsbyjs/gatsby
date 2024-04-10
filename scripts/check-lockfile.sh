#!/bin/bash
if git status --porcelain pnpm-lock.yaml | grep "M pnpm-lock.yaml"
    then echo "pnpm-lock.yaml is dirty. Please run 'pnpm install -r' in root of monorepo and commit changes to 'pnpm-lock.yaml' file."
    exit 1
else exit 0
fi
