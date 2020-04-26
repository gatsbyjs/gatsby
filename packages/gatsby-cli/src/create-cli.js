const path = require(`path`)
const resolveCwd = require(`resolve-cwd`)
const yargs = require(`yargs`)
const report = require(`./reporter`)
const { setStore } = require(`./reporter/redux`)
const { didYouMean } = require(`./did-you-mean`)
const { getLocalGatsbyVersion } = require(`./util/version`)
const envinfo = require(`envinfo`)
const existsSync = require(`fs-exists-cached`).sync
const clipboardy = require(`clipboardy`)
const {
  trackCli,
  setDefaultTags,
  setTelemetryEnabled,
} = require(`gatsby-telemetry`)

const handlerP = fn => (...args) => {
  Promise.resolve(fn(...args)).then(
    () => process.exit(0),
    err => report.panic(err)
  )
}

function buildLocalCommands(cli, isLocalSite) {
  const defaultHost = `localhost`
  const defaultPort = `8000`
  const directory = path.resolve(`.`)

  // 'not dead' query not available in browserslist used in Gatsby v1
  const DEFAULT_BROWSERS =
    getLocalGatsbyMajorVersion() === 1
      ? [`> 1%`, `last 2 versions`, `IE >= 9`]
      : [`>0.25%`, `not dead`]

  const siteInfo = { directory, browserslist: DEFAULT_BROWSERS }
  const useYarn = existsSync(path.join(directory, `yarn.lock`))
  if (isLocalSite) {
    const json = require(path.join(directory, `package.json`))
    siteInfo.sitePackageJson = json
    siteInfo.browserslist = json.browserslist || siteInfo.browserslist
  }

  function getLocalGatsbyMajorVersion() {
    let version = getLocalGatsbyVersion()

    if (version) {
      version = Number(version.split(`.`)[0])
    }

    return version
  }

  function resolveLocalCommand(command) {
    if (!isLocalSite) {
      cli.showHelp()
      report.verbose(`current directory: ${directory}`)
      return report.panic(
        `gatsby <${command}> can only be run for a gatsby site.\n` +
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
          `There was a problem loading the local ${command} command. Gatsby may not be installed in your site's "node_modules" directory. Perhaps you need to run "npm install"? You might need to delete your "package-lock.json" as well.`
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

      report.setNoColor(argv.noColor || process.env.NO_COLOR)

      process.env.gatsby_log_level = argv.verbose ? `verbose` : `normal`
      report.verbose(`set gatsby_log_level: "${process.env.gatsby_log_level}"`)

      process.env.gatsby_executing_command = command
      report.verbose(`set gatsby_executing_command: "${command}"`)

      const localCmd = resolveLocalCommand(command)
      const args = { ...argv, ...siteInfo, report, useYarn, setStore }

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
          default: process.env.PORT || defaultPort,
          describe: process.env.PORT
            ? `Set port. Defaults to ${process.env.PORT} (set by env.PORT) (otherwise defaults ${defaultPort})`
            : `Set port. Defaults to ${defaultPort}`,
        })
        .option(`o`, {
          alias: `open`,
          type: `boolean`,
          describe: `Open the site in your (default) browser for you.`,
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
        .option(`open-tracing-config-file`, {
          type: `string`,
          describe: `Tracer configuration file (OpenTracing compatible). See https://gatsby.dev/tracing`,
        }),
    handler: handlerP(
      getCommandHandler(`develop`, (args, cmd) => {
        process.env.NODE_ENV = process.env.NODE_ENV || `development`
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
        default:
          process.env.PREFIX_PATHS === `true` ||
          process.env.PREFIX_PATHS === `1`,
        describe: `Build site with link paths prefixed with the pathPrefix value in gatsby-config.js. Default is env.PREFIX_PATHS or false.`,
      })
        .option(`no-uglify`, {
          type: `boolean`,
          default: false,
          describe: `Build site without uglifying JS bundles (for debugging).`,
        })
        .option(`profile`, {
          type: `boolean`,
          default: false,
          describe: `Build site with react profiling (this can add some additional overhead). See https://reactjs.org/docs/profiler`,
        })
        .option(`open-tracing-config-file`, {
          type: `string`,
          describe: `Tracer configuration file (OpenTracing compatible). See https://gatsby.dev/tracing`,
        }),
    handler: handlerP(
      getCommandHandler(`build`, (args, cmd) => {
        process.env.NODE_ENV = `production`
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
          describe: `Open the site in your (default) browser for you.`,
        })
        .option(`prefix-paths`, {
          type: `boolean`,
          default:
            process.env.PREFIX_PATHS === `true` ||
            process.env.PREFIX_PATHS === `1`,
          describe: `Serve site with link paths prefixed with the pathPrefix value in gatsby-config.js.Default is env.PREFIX_PATHS or false.`,
        }),

    handler: getCommandHandler(`serve`),
  })

  cli.command({
    command: `info`,
    desc: `Get environment information for debugging and issue reporting`,
    builder: _ =>
      _.option(`C`, {
        alias: `clipboard`,
        type: `boolean`,
        default: false,
        describe: `Automagically copy environment information to clipboard`,
      }),
    handler: args => {
      try {
        const copyToClipboard =
          // Clipboard is not accessible when on a linux tty
          process.platform === `linux` && !process.env.DISPLAY
            ? false
            : args.clipboard

        envinfo
          .run({
            System: [`OS`, `CPU`, `Shell`],
            Binaries: [`Node`, `npm`, `Yarn`],
            Browsers: [`Chrome`, `Edge`, `Firefox`, `Safari`],
            Languages: [`Python`],
            npmPackages: `gatsby*`,
            npmGlobalPackages: `gatsby*`,
          })
          .then(envinfoOutput => {
            console.log(envinfoOutput)

            if (copyToClipboard) {
              clipboardy.writeSync(envinfoOutput)
            }
          })
      } catch (err) {
        console.log(`Error: Unable to print environment info`)
        console.log(err)
      }
    },
  })

  cli.command({
    command: `feedback`,
    builder: _ =>
      _.option(`disable`, {
        type: `boolean`,
        describe: `Opt out of future feedback requests`,
      }).option(`enable`, {
        type: `boolean`,
        describe: `Opt into future feedback requests`,
      }),
    handler: getCommandHandler(`feedback`),
  })

  cli.command({
    command: `clean`,
    desc: `Wipe the local gatsby environment including built assets and cache`,
    handler: getCommandHandler(`clean`),
  })

  cli.command({
    command: `repl`,
    desc: `Get a node repl with context of Gatsby environment, see (https://www.gatsbyjs.org/docs/gatsby-repl/)`,
    handler: getCommandHandler(`repl`, (args, cmd) => {
      process.env.NODE_ENV = process.env.NODE_ENV || `development`
      return cmd(args)
    }),
  })
}

function isLocalGatsbySite() {
  let inGatsbySite = false
  try {
    const { dependencies, devDependencies } = require(path.resolve(
      `./package.json`
    ))
    inGatsbySite =
      (dependencies && dependencies.gatsby) ||
      (devDependencies && devDependencies.gatsby)
  } catch (err) {
    /* ignore */
  }
  return !!inGatsbySite
}

function getVersionInfo() {
  const { version } = require(`../package.json`)
  const isGatsbySite = isLocalGatsbySite()
  if (isGatsbySite) {
    // we need to get the version from node_modules
    let gatsbyVersion = getLocalGatsbyVersion()

    if (!gatsbyVersion) {
      gatsbyVersion = `unknown`
    }

    return `Gatsby CLI version: ${version}
Gatsby version: ${gatsbyVersion}
  Note: this is the Gatsby version for the site at: ${process.cwd()}`
  } else {
    return `Gatsby CLI version: ${version}`
  }
}

module.exports = argv => {
  const cli = yargs()
  const isLocalSite = isLocalGatsbySite()

  cli
    .scriptName(`gatsby`)
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
      alias: `no-colors`,
      default: false,
      type: `boolean`,
      describe: `Turn off the color in output`,
      global: true,
    })
    .option(`json`, {
      describe: `Turn on the JSON logger`,
      default: false,
      type: `boolean`,
      global: true,
    })

  buildLocalCommands(cli, isLocalSite)

  try {
    const { version } = require(`../package.json`)
    cli.version(
      `version`,
      `Show the version of the Gatsby CLI and the Gatsby package in the current project`,
      getVersionInfo()
    )
    setDefaultTags({ gatsbyCliVersion: version })
  } catch (e) {
    // ignore
  }

  trackCli(argv)

  return cli
    .command({
      command: `new [rootPath] [starter]`,
      desc: `Create new Gatsby project.`,
      handler: handlerP(({ rootPath, starter }) => {
        const { initStarter } = require(`./init-starter`)
        return initStarter(starter, { rootPath })
      }),
    })
    .command(`plugin`, `Useful commands relating to Gatsby plugins`, yargs =>
      yargs
        .command({
          command: `docs`,
          desc: `Helpful info about using and creating plugins`,
          handler: handlerP(() =>
            console.log(`
Using a plugin:
- What is a Plugin? (https://www.gatsbyjs.org/docs/what-is-a-plugin/)
- Using a Plugin in Your Site (https://www.gatsbyjs.org/docs/using-a-plugin-in-your-site/)
- What You Don't Need Plugins For (https://www.gatsbyjs.org/docs/what-you-dont-need-plugins-for/)
- Loading Plugins from Your Local Plugins Folder (https://www.gatsbyjs.org/docs/loading-plugins-from-your-local-plugins-folder/)
- Plugin Library (https://www.gatsbyjs.org/plugins/)

Creating a plugin:
- Naming a Plugin (https://www.gatsbyjs.org/docs/naming-a-plugin/)
- Files Gatsby Looks for in a Plugin (https://www.gatsbyjs.org/docs/files-gatsby-looks-for-in-a-plugin/)
- Creating a Generic Plugin (https://www.gatsbyjs.org/docs/creating-a-generic-plugin/)
- Creating a Local Plugin (https://www.gatsbyjs.org/docs/creating-a-local-plugin/)
- Creating a Source Plugin (https://www.gatsbyjs.org/docs/creating-a-source-plugin/)
- Creating a Transformer Plugin (https://www.gatsbyjs.org/docs/creating-a-transformer-plugin/)
- Submit to Plugin Library (https://www.gatsbyjs.org/contributing/submit-to-plugin-library/)
- Pixabay Source Plugin Tutorial (https://www.gatsbyjs.org/tutorial/pixabay-source-plugin-tutorial/)
- Maintaining a Plugin (https://www.gatsbyjs.org/docs/maintaining-a-plugin/)
- Join Discord #plugin-authoring channel to ask questions! (https://gatsby.dev/discord/)
          `)
          ),
        })
        .demandCommand(
          1,
          `Pass --help to see all available commands and options.`
        )
    )
    .command({
      command: `telemetry`,
      desc: `Enable or disable Gatsby anonymous analytics collection.`,
      builder: yargs =>
        yargs
          .option(`enable`, {
            type: `boolean`,
            description: `Enable telemetry (default)`,
          })
          .option(`disable`, {
            type: `boolean`,
            description: `Disable telemetry`,
          }),

      handler: handlerP(({ enable, disable }) => {
        const enabled = enable || !disable
        setTelemetryEnabled(enabled)
        report.log(`Telemetry collection ${enabled ? `enabled` : `disabled`}`)
      }),
    })
    .wrap(cli.terminalWidth())
    .demandCommand(1, `Pass --help to see all available commands and options.`)
    .strict()
    .fail((msg, err, yargs) => {
      const availableCommands = yargs.getCommands().map(commandDescription => {
        const [command] = commandDescription
        return command.split(` `)[0]
      })
      const arg = argv.slice(2)[0]
      const suggestion = arg ? didYouMean(arg, availableCommands) : ``

      cli.showHelp()
      report.log(suggestion)
      report.log(msg)
    })
    .parse(argv.slice(2))
}
