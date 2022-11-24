#!/bin/bash 
if git status --porcelain yarn.lock | grep "M yarn.lock"
    then echo "yarn.lock is dirty. Please run 'yarn' in root of monorepo and commit changes to 'yarn.lock' file."
    exit 1
else exit 0
fi
