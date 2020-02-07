#!/usr/bin/env node
const getUnownedPackages = require(`../get-unowned-packages`)

getUnownedPackages()
  .then(({ packages, user }) => {
    if (packages.length > 0) {
      console.warn(
        `The following packages will fail to publish, please add access for ${user}:`
      )
      console.warn(packages.map(pkg => ` - ${pkg.name}`).join(`\n`))
      process.exit(1)
    }
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
