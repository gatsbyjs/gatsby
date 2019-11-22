// This file runs the typescript checker against packages.
// you can run it against all:
//   `node ./scripts/check-ts`
//
// or even scope it to specific packages.
//   `node ./scripts/check-ts gatsby-cli`
"use strict"

const fs = require(`fs`)
const path = require(`path`)
const chalk = require(`chalk`)
const yargs = require(`yargs`)
const execa = require(`execa`)

console.log(`TS Check: Running...`)

const PACKAGES_DIR = path.resolve(__dirname, `../packages`)

const filterPackage = yargs.argv._[0]

const packages = fs
  .readdirSync(PACKAGES_DIR)
  .map(file => path.resolve(PACKAGES_DIR, file))
  .filter(f => fs.lstatSync(path.resolve(f)).isDirectory())

let packagesWithTs = packages.filter(p =>
  fs.existsSync(path.resolve(p, `tsconfig.json`))
)

if (filterPackage) {
  packagesWithTs = packagesWithTs.filter(project =>
    project.endsWith(filterPackage)
  )

  if (packagesWithTs.length === 0) {
    console.log()
    console.error(chalk.red(`Error:`))
    console.log(
      chalk.red(
        `A package matching "${filterPackage}" did not find a package with TypeScript enabled.`
      )
    )
    console.log(
      chalk.red(
        `Make sure that package exists at "/packages/${filterPackage}" and has a tsconfig.json file`
      )
    )
    console.log()
    process.exit(1)
  }
}

packagesWithTs.forEach(project => {
  console.log(
    `TS Check: Checking ./packages/${project.split(/.*packages\//)[1]}`
  )

  const args = [
    `--max-old-space-size=4096`,
    path.resolve(
      require.resolve(`typescript/package.json`),
      `..`,
      require(`typescript/package.json`).bin.tsc
    ),
    `-p`,
    project,
    `--noEmit`,
  ]

  try {
    execa.sync(`node`, args, { stdio: `inherit` })
  } catch (e) {
    process.exit(1)
  }
})

console.log(`TS Check: Success`)
