#!/bin/bash
SRC_PATH=$1
CUSTOM_COMMAND="${2:-test}"
GATSBY_PATH="/home/circleci/project"

sudo npm install -g gatsby-dev-cli &&

# setting up child integration test link to gatsby packages
cd $SRC_PATH &&
yarn &&
gatsby-dev --set-path-to-repo $GATSBY_PATH &&
gatsby-dev --scan-once --copy-all && # copies _all_ files in gatsby/packages
yarn $CUSTOM_COMMAND &&
echo "Integration test run succeeded"
