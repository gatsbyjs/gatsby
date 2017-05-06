#!/usr/bin/env node

const Configstore = require(`configstore`)
const pkg = require(`../package.json`)
const _ = require(`lodash`)
const path = require(`path`)
const watch = require(`./watch`)

const argv = require(`yargs`)
  .usage(`Usage: gatsby-dev [options]`)
  .alias(`q`, `quiet`)
  .nargs(`q`, 0)
  .describe(`q`, `Do not output copy file information`)
  .alias(`s`, `scan-once`)
  .nargs(`s`, 0)
  .describe(`s`, `Scan once. Do not start file watch`)
  .alias(`p`, `set-path-to-repo`)
  .nargs(`p`, 0)
  .describe(
    `p`,
    `Set path to Gatsby repository.
You typically only need to configure this once.`
  )
  .help(`h`)
  .alias(`h`, `help`)
  .array(`packages`).argv

const conf = new Configstore(pkg.name)

const fs = require(`fs-extra`)
const havePackageJsonFile = fs.existsSync(`package.json`)

if (!havePackageJsonFile) {
  console.error(`Current folder must have a package.json file!`)
  process.exit()
}

const localPkg = JSON.parse(fs.readFileSync(`package.json`))
const packages = Object.keys(
  _.merge({}, localPkg.dependencies, localPkg.devDependencies)
)

const gatsbyPackages = packages.filter(p => p.startsWith(`gatsby`))

const pathToRepo = argv[`set-path-to-repo`]
if (pathToRepo) {
  console.log(`Saving path to your Gatsby repo`)
  conf.set(`gatsby-location`, path.resolve(pathToRepo))
  process.exit()
}

const gatsbyLocation = conf.get(`gatsby-location`)

if (!gatsbyLocation) {
  console.error(`
You haven't set the path yet to your cloned
version of Gatsby. Do so now by running:

gatsby-dev --set-path-to-repo /path/to/my/cloned/version/gatsby
`)
  process.exit()
}

if (!argv.packages && _.isEmpty(gatsbyPackages)) {
  console.error(`
You haven't got any gatsby dependencies into your current package.json

You probably want to pass in a list of packages to start
developing on! For example:

gatsby-dev --packages gatsby gatsby-transformer-remark

If you prefer to place them in your package.json dependencies instead,
gatsby-dev will pick them up.
`)
  process.exit()
}

watch(gatsbyLocation, argv.packages || gatsbyPackages, {
  quiet: argv.quiet,
  scanOnce: argv[`scan-once`],
})
