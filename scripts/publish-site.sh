#!/bin/sh
yarn bootstrap
npm install -g gatsby-dev-cli
gatsby-dev --set-path-to-repo .

echo "=== Installing the website dependencies"
cd "$1" || exit

# Normally you wouldn't do this but we
# want to test the latest versions of packages always
# so our example site builds catch problems early.
yarn

echo "=== Copying built Gatsby to website."
gatsby-dev --scan-once

# copy file if target dir exists
FRAGMENTSDIR="node_modules/gatsby-transformer-sharp/src"
[ -d "$FRAGMENTSDIR" ] && cp ../../packages/gatsby-transformer-sharp/src/fragments.js "$FRAGMENTSDIR/fragments.js"

echo "=== Building website"
# Once we get better cache invalidation, remove the following line
rm -rf .cache

NODE_ENV=production ./node_modules/.bin/gatsby build
