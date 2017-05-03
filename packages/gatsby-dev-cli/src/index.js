#!/usr/bin/env node

const Configstore = require(`configstore`)
const pkg = require(`../package.json`)
const argv = require(`yargs`).array(`packages`).argv
const _ = require(`lodash`)
const path = require(`path`)

const conf = new Configstore(pkg.name)

const fs = require(`fs-extra`)
const havePackageJsonFile = fs.existsSync(`package.json`)

if (!havePackageJsonFile) {
  console.error(`Current folder must have a package.json file!`)
  process.exit()
}

const localPkg = JSON.parse(fs.readFileSync(`package.json`))
const packages = Object.keys({
  ...localPkg.dependencies,
  ...localPkg.devDependencies,
})
const gatsbyPackages = packages.filter(p => p.startsWith(`gatsby`))

if (argv.setPathToRepo) {
  console.log(`Saving path to your Gatsby repo`)
  conf.set(`gatsby-location`, path.resolve(argv.setPathToRepo))
  process.exit()
}

const gatsbyLocation = conf.get(`gatsby-location`)

if (!gatsbyLocation) {
  console.error(
    `
You haven't set the path yet to your cloned
version of Gatsby. Do so now by running:

gatsby-dev --set-path-to-repo /path/to/my/cloned/version/gatsby
`
  )
  process.exit()
}

if (!argv.packages && _.isEmpty(gatsbyPackages)) {
  console.error(
    `
You haven't got any gatsby dependencies into your current package.json

You probably want to pass in a list of packages to start
developing on! For example:

gatsby-dev --packages gatsby gatsby-typegen-remark

If you prefer to place them in your package.json dependencies instead,
gatsby-dev will pick them up.
`
  )
  process.exit()
}

const watch = require(`./watch`)
watch(gatsbyLocation, argv.packages || gatsbyPackages, argv)
