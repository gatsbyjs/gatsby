#!/bin/bash

echo "=== Installing the website dependencies"
cd "$1" || exit
yarn
echo "=== Building website"
NODE_ENV=production ./node_modules/.bin/gatsby build
