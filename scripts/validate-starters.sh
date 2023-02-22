#!/bin/bash

GLOB=$1
IS_CI="${CI:-false}"
BASE=$(pwd)

if [ "$IS_CI" = true ]; then
  sudo apt-get update && sudo apt-get install jq
fi

for folder in $GLOB; do
  [ -d "$folder" ] || continue # only directories

  if [ "$folder" = "starters/gatsby-starter-theme-workspace" ]; then
    # Theme starter directory layout doesn't play well with validation below
    # so we skip it for now
    continue
  fi

  cd "$BASE" || exit

  # validate
  cd "$folder" || exit

  echo ""
  echo "Validating $folder"
  echo ""

  npm ci --legacy-peer-deps || exit 1

  # check both npm and yarn, sometimes yarn registry lags behind
  rm -rf node_modules &&
  yarn &&
  npm run build ||
  exit 1

  cd "$BASE" || exit
done
