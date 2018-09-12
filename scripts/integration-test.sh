#!/bin/bash
INTEGRATION_TEST=$1
SRC_PATH=$2
GATSBY_PATH="${TRAVIS_BUILD_DIR:-../../}" # set to third arg if defined, otherwise use ../../

if [[ "$INTEGRATION_TEST" = true ]]; then
  npm install -g gatsby-dev-cli@next

  # bootstrapping all packages so we test _this_ PR's changes
  echo "=== bootstrapping $(pwd)"
  yarn bootstrap

  # setting up child integration test link to gatsby packages
  cd $SRC_PATH
  echo "=== setting up link to current changes with gatsby-dev in $(pwd)"
  gatsby-dev --set-path-to-repo $GATSBY_PATH
  gatsby-dev --scan-once --quiet --copy-all # copies _all_ files in gatsby/packages
fi
