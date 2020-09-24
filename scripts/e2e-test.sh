#!/bin/bash
set -e # bail on errors

SRC_PATH=$1
CUSTOM_COMMAND="${2:-yarn test}"
GATSBY_PATH="${CIRCLE_WORKING_DIRECTORY:-../..}"

# cypress docker does not support sudo and does not need it, but the default node executor does
# command -v gatsby-dev || command -v sudo && sudo npm install -g gatsby-dev-cli || npm install -g gatsby-dev-cli &&

# setting up child integration test link to gatsby packages
cd "$SRC_PATH" &&
node "${GATSBY_PATH}/packages/gatsby-dev-cli/dist/index.js" --set-path-to-repo "$GATSBY_PATH" &&
node "${GATSBY_PATH}/packages/gatsby-dev-cli/dist/index.js" --force-install --scan-once  && # install _all_ files in gatsby/packages
((test -f  ./node_modules/.bin/gatsby && chmod +x ./node_modules/.bin/gatsby && echo "Gatsby bin chmoded") || echo "Gatsby bin doesn't exist. Skipping chmod.") && # this is sometimes necessary to ensure executable
sh -c "$CUSTOM_COMMAND" &&
echo "e2e test run succeeded"
