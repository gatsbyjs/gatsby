// babel-preset-env doesn't find this import if you
// use require() with backtick strings so use the es6 syntax
import "babel-polyfill"

const program = require(`commander`)
const packageJson = require(`../../package.json`)
const path = require(`path`)
const _ = require(`lodash`)
const Promise = require(`bluebird`)
const resolveCwd = require(`resolve-cwd`)

const report = require(`../reporter`)
const testRequireError = require(`../utils/test-require-error`)

// Improve Promise error handling. Maybe... what's the best
// practice for this these days?
global.Promise = require(`bluebird`)

Promise.onPossiblyUnhandledRejection(error => {
  report.error(error)
  throw error
})

process.on(`unhandledRejection`, error => {
  // This will exit the process in newer Node anyway so lets be consistent
  // across versions and crash
  report.panic(`UNHANDLED REJECTION`, error)
})

process.on(`uncaughtException`, error => {
  report.panic(`UNHANDLED EXCEPTION`, error)
})

const defaultHost = `localhost`

let inGatsbySite = false
let localPackageJSON
try {
  localPackageJSON = require(path.resolve(`./package.json`))
  if (localPackageJSON.dependencies && localPackageJSON.dependencies.gatsby) {
    inGatsbySite = true
  }
} catch (err) {
  if (testRequireError(`package.json`, err)) {
    // ignore
  } else {
    report.error(`There is an error in your site's package.json`, err)
    process.exit(1)
  }
}

const directory = path.resolve(`.`)
const getSiteInfo = () => {
  const sitePackageJson = require(path.join(directory, `package.json`))
  const browserslist = sitePackageJson.browserslist || [
    `> 1%`,
    `last 2 versions`,
    `IE >= 9`,
  ]
  return { sitePackageJson, browserslist }
}

program.version(packageJson.version).usage(`[command] [options]`)

// If there's a package.json in the current directory w/ a gatsby dependency
// include the develop/build/serve commands. Otherwise, just the new.
if (inGatsbySite) {
  program
    .command(`develop`)
    .description(
      `Start development server. Watches files and rebuilds and hot reloads ` +
        `if something changes`
    ) // eslint-disable-line max-len
    .option(
      `-H, --host <url>`,
      `Set host. Defaults to ${defaultHost}`,
      defaultHost
    )
    .option(`-p, --port <port>`, `Set port. Defaults to 8000`, `8000`)
    .option(`-o, --open`, `Open the site in your browser for you.`)
    .action(command => {
      const developPath = resolveCwd(`gatsby/dist/utils/develop`)
      const develop = require(developPath)
      // console.timeEnd(`time to load develop`)
      const { sitePackageJson, browserslist } = getSiteInfo()
      const p = {
        ...command,
        directory,
        sitePackageJson,
        browserslist,
      }
      develop(p)
    })

  program
    .command(`build`)
    .description(`Build a Gatsby project.`)
    .option(
      `--prefix-paths`,
      `Build site with link paths prefixed (set prefix in your config).`
    )
    .action(command => {
      // Set NODE_ENV to 'production'
      process.env.NODE_ENV = `production`

      const buildPath = resolveCwd(`gatsby/dist/utils/build`)
      const build = require(buildPath)
      const { sitePackageJson, browserslist } = getSiteInfo()
      const p = {
        ...command,
        directory,
        sitePackageJson,
        browserslist,
      }
      build(p).then(() => {
        report.success(`Done building in ${process.uptime()} seconds`)
        process.exit()
      })
    })

  program
    .command(`serve`)
    .description(`Serve built site.`)
    .option(
      `-H, --host <url>`,
      `Set host. Defaults to ${defaultHost}`,
      defaultHost
    )
    .option(`-p, --port <port>`, `Set port. Defaults to 9000`, `9000`)
    .option(`-o, --open`, `Open the site in your browser for you.`)
    .action(command => {
      const servePath = resolveCwd(`gatsby/dist/utils/serve`)
      const serve = require(servePath)
      const { sitePackageJson, browserslist } = getSiteInfo()
      const p = {
        ...command,
        directory,
        sitePackageJson,
        browserslist,
      }
      serve(p)
    })
}

program
  .command(`new [rootPath] [starter]`)
  .description(`Create new Gatsby project.`)
  .action((rootPath, starter) => {
    const newCommand = require(`../utils/new`)
    newCommand(rootPath, starter)
  })

program.on(`--help`, () => {
  console.log(
    `To show subcommand help:

    gatsby [command] -h
`
  )
})

// If the user types an unknown sub-command, just display the help.
const subCmd = process.argv.slice(2, 3)[0]
let cmds = _.map(program.commands, `_name`)
cmds = cmds.concat([`--version`, `-V`])

if (!_.includes(cmds, subCmd)) {
  program.help()
} else {
  program.parse(process.argv)
}
