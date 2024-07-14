#!/bin/bash

# this script will make checked out files move around and make git working directory dirty
# this is primarly for setting up monorepo structure for e2e tests that run in CI to avoid
# having to maintain additional fixture as we want to test all the same things as in single repo
# case

# move all items in the current directory to a new directory called workspace
rm -rf workspace
items=(*)
mkdir workspace
mv ${items[*]} workspace

# create root package.json and mark workspace directory as a npm/yarn workspace
echo '{ "workspaces": ["workspace"], "scripts": { "test": "EXTRA_NTL_CLI_ARGS=\"--filter=workspace\" E2E_MONOREPO=\"true\" npm run test -w workspace" }, "private": true }' > package.json

# update netlify.toml build command and publish dir
sed -i.bak -e 's/npm run build/npm run build -w workspace/g' -e 's/public/workspace\/public/g' workspace/netlify.toml

# update workspace's package.json to have correct path to helper script after moving site fixture into subdirectory
sed -i.bak -e 's/..\/..\/scripts\/cypress-run-with-conditional-record-flag.js/..\/..\/..\/scripts\/cypress-run-with-conditional-record-flag.js/g' workspace/package.json

git init

