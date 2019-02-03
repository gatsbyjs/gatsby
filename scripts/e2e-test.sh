#!/bin/bash
SRC_PATH=$1
CUSTOM_COMMAND="${2:-yarn test}"
GATSBY_PATH="${CIRCLE_WORKING_DIRECTORY:-../../}"

# npm install -g gatsby-dev-cli &&

# setting up child integration test link to gatsby packages
cd $SRC_PATH &&
yarn &&
#gatsby-dev --set-path-to-repo $GATSBY_PATH &&
#gatsby-dev --scan-once --copy-all --quiet && # copies _all_ files in gatsby/packages
node ../../packages/gatsby-dev-cli/dist/index.js --set-path-to-repo $GATSBY_PATH &&
node ../../packages/gatsby-dev-cli/dist/index.js --scan-once --quiet && # copies _all_ files in gatsby/packages
chmod +x ./node_modules/.bin/gatsby && # this is sometimes necessary to ensure executable
sh -c "$CUSTOM_COMMAND" &&
echo "e2e test run succeeded"
