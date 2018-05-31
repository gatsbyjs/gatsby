const path = require(`path`)
const resolveCwd = require(`resolve-cwd`)
const yargs = require(`yargs`)
const report = require(`./reporter`)
const fs = require(`fs`)

const DEFAULT_BROWSERS = [`> 1%`, `last 2 versions`, `IE >= 9`]

const handlerP = fn => (...args) => {
  Promise.resolve(fn(...args)).then(
    () => process.exit(0),
    err => report.panic(err)
  )
}

function buildLocalCommands(cli, isLocalSite) {
  const defaultHost = `localhost`
  const directory = path.resolve(`.`)

  let siteInfo = { directory, browserslist: DEFAULT_BROWSERS }
  const useYarn = fs.existsSync(path.join(directory, `yarn.lock`))
  if (isLocalSite) {
    const json = require(path.join(directory, `package.json`))
    siteInfo.sitePackageJson = json
    siteInfo.browserslist = json.browserslist || siteInfo.browserslist
  }

  function resolveLocalCommand(command) {
    if (!isLocalSite) {
      cli.showHelp()
      report.verbose(`current directory: ${directory}`)
      return report.panic(
        `gatsby <${command}> can only be run for a gatsby site. \n` +
          `Either the current working directory does not contain a valid package.json or ` +
          `'gatsby' is not specified as a dependency`
      )
    }

    try {
      const cmdPath =
        resolveCwd.silent(`gatsby/dist/commands/${command}`) ||
        // Old location of commands
        resolveCwd.silent(`gatsby/dist/utils/${command}`)
      if (!cmdPath)
        return report.panic(
          `There was a problem loading the local ${command} command. Gatsby may not be installed. Perhaps you need to run "npm install"?`
        )

      report.verbose(`loading local command from: ${cmdPath}`)
      return require(cmdPath)
    } catch (err) {
      cli.showHelp()
      return report.panic(
        `There was a problem loading the local ${command} command. Gatsby may not be installed. Perhaps you need to run "npm install"?`,
        err
      )
    }
  }

  function getCommandHandler(command, handler) {
    return argv => {
      report.setVerbose(!!argv.verbose)
      report.setNoColor(!!argv.noColor)

      process.env.gatsby_log_level = argv.verbose ? `verbose` : `normal`
      report.verbose(`set gatsby_log_level: "${process.env.gatsby_log_level}"`)

      process.env.gatsby_executing_command = command
      report.verbose(`set gatsby_executing_command: "${command}"`)

      let localCmd = resolveLocalCommand(command)
      let args = { ...argv, ...siteInfo, useYarn }

      report.verbose(`running command: ${command}`)
      return handler ? handler(args, localCmd) : localCmd(args)
    }
  }

  cli.command({
    command: `develop`,
    desc:
      `Start development server. Watches files, rebuilds, and hot reloads ` +
      `if something changes`,
    builder: _ =>
      _.option(`H`, {
        alias: `host`,
        type: `string`,
        default: defaultHost,
        describe: `Set host. Defaults to ${defaultHost}`,
      })
        .option(`p`, {
          alias: `port`,
          type: `string`,
          default: `8000`,
          describe: `Set port. Defaults to 8000`,
        })
        .option(`o`, {
          alias: `open`,
          type: `boolean`,
          describe: `Open the site in your browser for you.`,
        })
        .option(`S`, {
          alias: `https`,
          type: `boolean`,
          describe: `Use HTTPS. See https://www.gatsbyjs.org/docs/local-https/ as a guide`,
        })
        .option(`c`, {
          alias: `cert-file`,
          type: `string`,
          default: ``,
          describe: `Custom HTTPS cert file (relative path; also required: --https, --key-file). See https://www.gatsbyjs.org/docs/local-https/`,
        })
        .option(`k`, {
          alias: `key-file`,
          type: `string`,
          default: ``,
          describe: `Custom HTTPS key file (relative path; also required: --https, --cert-file). See https://www.gatsbyjs.org/docs/local-https/`,
        })
        .option(`build-dir`, {
          alias: `buildDirectory`,
          type: `string`,
          default: `public`,
          describe: `Set build directory. Defaults to public`,
        }),
    handler: handlerP(
      getCommandHandler(`develop`, (args, cmd) => {
        process.env.NODE_ENV = process.env.NODE_ENV || `development`

        process.env.GATSBY_BUILD_DIR = process.env.GATSBY_BUILD_DIR || path.resolve(args.buildDirectory)  || `public`
        if (!fs.existsSync(process.env.GATSBY_BUILD_DIR)) {
          fs.mkdirSync(process.env.GATSBY_BUILD_DIR)
        }

        cmd(args)
        // Return an empty promise to prevent handlerP from exiting early.
        // The development server shouldn't ever exit until the user directly
        // kills it so this is fine.
        return new Promise(resolve => {})
      })
    ),
  })

  cli.command({
    command: `build`,
    desc: `Build a Gatsby project.`,
    builder: _ =>
      _.option(`prefix-paths`, {
        type: `boolean`,
        default: false,
        describe: `Build site with link paths prefixed (set prefix in your config).`,
      }).option(`no-uglify`, {
        type: `boolean`,
        default: false,
        describe: `Build site without uglifying JS bundles (for debugging).`,
      }).option(`build-dir`, {
        alias: `buildDirectory`,
        type: `string`,
        default: `public`,
        describe: `Set build directory. Defaults to public`,
      }),
    handler: handlerP(
      getCommandHandler(`build`, (args, cmd) => {
        process.env.NODE_ENV = `production`

        process.env.GATSBY_BUILD_DIR = process.env.GATSBY_BUILD_DIR || path.resolve(args.buildDirectory)  || `public`
        if (!fs.existsSync(process.env.GATSBY_BUILD_DIR)) {
          fs.mkdirSync(process.env.GATSBY_BUILD_DIR)
        }
        
        return cmd(args)
      })
    ),
  })

  cli.command({
    command: `serve`,
    desc: `Serve previously built Gatsby site.`,
    builder: _ =>
      _.option(`H`, {
        alias: `host`,
        type: `string`,
        default: defaultHost,
        describe: `Set host. Defaults to ${defaultHost}`,
      })
        .option(`p`, {
          alias: `port`,
          type: `string`,
          default: `9000`,
          describe: `Set port. Defaults to 9000`,
        })
        .option(`o`, {
          alias: `open`,
          type: `boolean`,
          describe: `Open the site in your browser for you.`,
        }),

    handler: getCommandHandler(`serve`),
  })
}

function isLocalGatsbySite() {
  let inGatsbySite = false
  try {
    let { dependencies, devDependencies } = require(path.resolve(
      `./package.json`
    ))
    inGatsbySite =
      (dependencies && dependencies.gatsby) ||
      (devDependencies && devDependencies.gatsby)
  } catch (err) {
    /* ignore */
  }
  return inGatsbySite
}

module.exports = (argv, handlers) => {
  let cli = yargs()
  let isLocalSite = isLocalGatsbySite()

  cli
    .usage(`Usage: $0 <command> [options]`)
    .alias(`h`, `help`)
    .alias(`v`, `version`)
    .option(`verbose`, {
      default: false,
      type: `boolean`,
      describe: `Turn on verbose output`,
      global: true,
    })
    .option(`no-color`, {
      default: false,
      type: `boolean`,
      describe: `Turn off the color in output`,
      global: true,
    })

  buildLocalCommands(cli, isLocalSite)

  return cli
    .command({
      command: `new [rootPath] [starter]`,
      desc: `Create new Gatsby project.`,
      handler: handlerP(
        ({ rootPath, starter = `gatsbyjs/gatsby-starter-default` }) => {
          const initStarter = require(`./init-starter`)
          return initStarter(starter, { rootPath })
        }
      ),
    })
    .wrap(cli.terminalWidth())
    .demandCommand(1, `Pass --help to see all available commands and options.`)
    .strict()
    .showHelpOnFail(true)
    .recommendCommands()
    .parse(argv.slice(2))
}
