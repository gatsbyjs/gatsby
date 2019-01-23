#!/bin/bash
SRC_PATH=$1
CUSTOM_COMMAND="${2:-test}"
GATSBY_PATH="${CIRCLE_WORKING_DIRECTORY:-../../}"

npm install -g gatsby-dev-cli &&

# setting up child integration test link to gatsby packages
cd $SRC_PATH &&
yarn &&
gatsby-dev --set-path-to-repo $GATSBY_PATH &&
gatsby-dev --scan-once --copy-all --quiet && # copies _all_ files in gatsby/packages
chmod +x ./node_modules/.bin/gatsby && # this is sometimes necessary to ensure executable
echo "running test with default GATSBY_DB_NODES env var (redux)" &&
yarn $CUSTOM_COMMAND &&
echo "running test with GATSBY_DB_NODES=loki" &&
GATSBY_DB_NODES=loki yarn $CUSTOM_COMMAND &&
echo "e2e test run succeeded"
