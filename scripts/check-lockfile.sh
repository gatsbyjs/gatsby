#!/bin/bash 
if git status --porcelain yarn.lock | grep "M yarn.lock"
    then echo "yarn.lock is dirty. Please ensure changes have been committed"
    exit 1
else exit 0
fi
