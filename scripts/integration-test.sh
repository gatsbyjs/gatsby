#!/bin/bash
INTEGRATION_TEST=$1
SRC_PATH=$2
RELATIVE_PATH="${3:-../../}" # set to third arg if defined, otherwise use ../../

if [[ "$INTEGRATION_TEST" = true ]]; then
  npm install -g gatsby-dev-cli

  # bootstrapping all packages so we test _this_ PR's changes
  echo "=== bootstrapping $(pwd)"
  yarn bootstrap

  # setting up child integration test link to gatsby packages
  cd $SRC_PATH
  echo "=== setting up link to current changes with gatsby-dev in $(pwd)"
  gatsby-dev --set-path-to-repo $RELATIVE_PATH
  gatsby-dev --scan-once --quiet
fi
