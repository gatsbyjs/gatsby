#!/usr/bin/env bash
SRC_PATH="$1"
GATSBY_PATH="${CIRCLE_WORKING_DIRECTORY:-../../}"

if [ -z $SRC_PATH ]; then
    echo "No SRC_PATH passed to compare-loki.sift.sh.
Usage: compare-loki-sift.sh path/to/gatsby/site"
    exit 1
fi

sudo npm install -g gatsby-dev-cli &&

# setting up child integration test link to gatsby packages
cd "$SRC_PATH" &&
yarn &&
gatsby-dev --set-path-to-repo "$GATSBY_PATH" &&
gatsby-dev --scan-once --copy-all --quiet && # copies _all_ files in gatsby/packages
chmod +x ./node_modules/.bin/gatsby && # this is sometimes necessary to ensure executable
node "$GATSBY_PATH/scripts/compare-loki-sift.js"
