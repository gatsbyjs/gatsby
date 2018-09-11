#!/bin/bash
INTEGRATION_TEST=$1
RELATIVE_PATH="${2:-../../}" # set to second arg if defined, otherwise use ../../

if [[ "$INTEGRATION_TEST" = true ]]; then
  npm install -g gatsby-dev-cli

  EXISTING_DIR=$(pwd)

  # bootstrapping all packages so we test _this_ PR's changes
  echo "=== bootstrapping"
  cd $RELATIVE_PATH
  yarn bootstrap

  # setting up child integration test link to gatsby packages
  cd $EXISTING_DIR
  echo "=== setting up link to current changes with gatsby-dev"
  gatsby-dev --set-path-to-repo $RELATIVE_PATH
  gatsby-dev --scan-once --quiet
fi
