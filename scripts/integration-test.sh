#!/bin/bash
SRC_PATH=$1
GATSBY_PATH="${CIRCLE_WORKING_DIRECTORY:-../../}"

sudo npm install -g gatsby-dev-cli

# setting up child integration test link to gatsby packages
cd $SRC_PATH
yarn
gatsby-dev --set-path-to-repo $GATSBY_PATH
gatsby-dev --scan-once --copy-all # copies _all_ files in gatsby/packages
yarn test
