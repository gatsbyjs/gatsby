#!/bin/bash
SRC_PATH=$1
CUSTOM_COMMAND="${2:-yarn test}"
GATSBY_PATH="${CIRCLE_WORKING_DIRECTORY:-../../}"

# cypress docker does not support sudo and does not need it, but the default node executor does
command -v gatsby-dev || command -v sudo && sudo npm install -g gatsby-dev-cli || npm install -g gatsby-dev-cli &&

# setting up child integration test link to gatsby packages
cd "$SRC_PATH" &&
gatsby-dev --set-path-to-repo "$GATSBY_PATH" &&
gatsby-dev --scan-once  && # copies _all_ files in gatsby/packages
chmod +x ./node_modules/.bin/gatsby && # this is sometimes necessary to ensure executable
sh -c "$CUSTOM_COMMAND" &&
echo "e2e test run succeeded"
