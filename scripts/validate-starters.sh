#!/bin/bash

GLOB=$1
IS_CI="${CI:-false}"
BASE=$(pwd)

if [ "$IS_CI" = true ]; then
  sudo apt-get update && sudo apt-get install jq
fi

for folder in $GLOB; do
  [ -d "$folder" ] || continue # only directories
  cd "$BASE" || exit

  # validate
  cd "$folder" || exit

  echo "Validating $folder"

  # WordPress has React 17 deps :/
  if [ "$folder" = "starters/gatsby-starter-wordpress-blog" ]; then
    npm ci --legacy-peer-deps || exit 1
  else
    npm ci || exit 1
  fi

  # check both npm and yarn, sometimes yarn registry lags behind
  rm -rf node_modules &&
  yarn &&
  npm run build ||
  exit 1

  cd "$BASE" || exit
done
