#!/usr/bin/env node

// Prints the publishable (non-private) monorepo packages as a JSON array of names.
//
// Used to exempt locally published (gatsby-dev-cli / verdaccio) versions from
// Yarn 4's minimum release age gate, which otherwise quarantines them:
//
//   yarn config set --json npmPreapprovedPackages \
//     "$(node /path/to/gatsby/scripts/list-publishable-packages.js)"

const { getPackages } = require(`@lerna/project`)
const filterPackages = require(`@lerna/filter-packages`)
const path = require(`path`)

const rootPath = path.join(__dirname, `..`)

getPackages(rootPath)
  .then(packages => {
    // last arg is `includePrivate` - private packages are never published
    const names = filterPackages(packages, [], [], false).map(pkg => pkg.name)

    console.log(JSON.stringify(names.sort()))
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
