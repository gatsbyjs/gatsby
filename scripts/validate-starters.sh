#!/bin/bash

GLOB=$1
IS_CI="${CI:-false}"
BASE=$(pwd)

# Starter validation intentionally runs Yarn 1 inside nested starter projects.
# Calling `yarn` directly from this pnpm-rooted repo can make Yarn/Corepack read
# the root packageManager field instead of the starter project, so pin Yarn 1
# explicitly for these repo-owned checks.
run_starter_yarn() {
  env COREPACK_ENABLE_STRICT=0 corepack yarn@1.22.22 "$@"
}

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
  run_starter_yarn &&
  npm run build ||
  exit 1

  cd "$BASE" || exit
done
