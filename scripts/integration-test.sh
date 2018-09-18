#!/bin/bash
SRC_PATH=$1
GATSBY_PATH="../../"

sudo npm install -g gatsby-dev-cli

# setting up child integration test link to gatsby packages
cd integration-tests/$SRC_PATH
yarn
echo "=== setting up link to current changes with gatsby-dev in $(pwd)"
gatsby-dev --set-path-to-repo $GATSBY_PATH
gatsby-dev --scan-once --quiet --copy-all # copies _all_ files in gatsby/packages
yarn test
