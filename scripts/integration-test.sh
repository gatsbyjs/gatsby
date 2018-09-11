#!/bin/sh
INTEGRATION_TEST=$1
SRC_PATH=$2

if [[ "$INTEGRATION_TEST" = true ]]; then
  npm install -g gatsby-dev-cli

  # bootstrapping all packages so we test _this_ PR's changes
  yarn bootstrap

  # setting up child integration test link to gatsby packages
  cd $SRC_PATH
  gatsby-dev --set-path-to-repo ../
  gatsby-dev --scan-once --quiet
  chmod +x ./node_modules/.bin/{gatsby,gatsby-cli} # this seems to be required to fix executables
fi
