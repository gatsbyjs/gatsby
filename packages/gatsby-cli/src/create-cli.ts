import path from "path"
import resolveCwd from "resolve-cwd"
import yargs from "yargs"
import report from "./reporter"
import { setStore } from "./reporter/redux"
import { getLocalGatsbyVersion } from "./util/version"
import envinfo from "envinfo"
import { sync as existsSync } from "fs-exists-cached"
import clipboardy from "clipboardy"
import { trackCli, setDefaultTags, setTelemetryEnabled } from "gatsby-telemetry"
import { initStarter } from "./init-starter"
import { recipesHandler } from "./recipes"
import { startGraphQLServer } from "gatsby-recipes"

const handlerP = (fn: Function) => (...args: unknown[]): void => {
  Promise.resolve(fn(...args)).then(
    () => process.exit(0),
    err => report.panic(err)
  )
}

function buildLocalCommands(cli: yargs.Argv, isLocalSite: boolean): void {
  const defaultHost = `localhost`
  const defaultPort = `8000`
  const directory = path.resolve(`.`)

  // 'not dead' query not available in browserslist used in Gatsby v1
  const DEFAULT_BROWSERS =
    getLocalGatsbyMajorVersion() === 1
      ? [`> 1%`, `last 2 versions`, `IE >= 9`]
      : [`>0.25%`, `not dead`]

  const siteInfo = {
    directory,
    browserslist: DEFAULT_BROWSERS,
    sitePackageJson: undefined,
  }

  const useYarn = existsSync(path.join(directory, `yarn.lock`))
  if (isLocalSite) {
    const json = require(path.join(directory, `package.json`))
    siteInfo.sitePackageJson = json
    siteInfo.browserslist = json.browserslist || siteInfo.browserslist
  }

  function getLocalGatsbyMajorVersion(): number | undefined {
    const version = getLocalGatsbyVersion()

    if (version) {
      return Number(version.split(`.`)[0])
    }

    return undefined
  }

  function resolveLocalCommand(command: string): Function | never {
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

      const cmd = require(cmdPath)
      if (cmd instanceof Function) {
        return cmd
      }

      return report.panic(
        `Handler for command "${command}" is not a function. Your Gatsby package might be corrupted, try reinstalling it and running the command again.`
      )
    } catch (err) {
      cli.showHelp()
      return report.panic(
        `There was a problem loading the local ${command} command. Gatsby may not be installed. Perhaps you need to run "npm install"?`,
        err
      )
    }
  }

  function getCommandHandler(
    command: string,
    handler?: (args: yargs.Arguments, cmd: Function) => void
  ) {
    return (argv: yargs.Arguments): void => {
      report.setVerbose(!!argv.verbose)

      report.setNoColor(!!(argv.noColor || process.env.NO_COLOR))

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
    describe:
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
          describe: `Custom HTTPS cert file (also required: --https, --key-file). See https://www.gatsbyjs.org/docs/local-https/`,
        })
        .option(`k`, {
          alias: `key-file`,
          type: `string`,
          default: ``,
          describe: `Custom HTTPS key file (also required: --https, --cert-file). See https://www.gatsbyjs.org/docs/local-https/`,
        })
        .option(`ca-file`, {
          type: `string`,
          default: ``,
          describe: `Custom HTTPS CA certificate file (also required: --https, --cert-file, --key-file).  See https://www.gatsbyjs.org/docs/local-https/`,
        })
        .option(`graphql-tracing`, {
          type: `boolean`,
          describe: `Trace every graphql resolver, may have performance implications`,
          default: false,
        })
        .option(`open-tracing-config-file`, {
          type: `string`,
          describe: `Tracer configuration file (OpenTracing compatible). See https://gatsby.dev/tracing`,
        })
        .option(`inspect`, {
          type: `number`,
          describe: `Opens a port for debugging. See https://www.gatsbyjs.org/docs/debugging-the-build-process/`,
          default: 9229,
        })
        .option(`inspect-brk`, {
          type: `number`,
          describe: `Opens a port for debugging. Will block until debugger is attached. See https://www.gatsbyjs.org/docs/debugging-the-build-process/`,
          default: 9229,
        }),
    handler: handlerP(
      getCommandHandler(`develop`, (args: yargs.Arguments, cmd: Function) => {
        process.env.NODE_ENV = process.env.NODE_ENV || `development`
        startGraphQLServer(siteInfo.directory, true)
        cmd(args)
        // Return an empty promise to prevent handlerP from exiting early.
        // The development server shouldn't ever exit until the user directly
        // kills it so this is fine.
        return new Promise(() => {})
      })
    ),
  })

  cli.command({
    command: `build`,
    describe: `Build a Gatsby project.`,
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
        .option(`graphql-tracing`, {
          type: `boolean`,
          describe: `Trace every graphql resolver, may have performance implications`,
          default: false,
        })
        .option(`open-tracing-config-file`, {
          type: `string`,
          describe: `Tracer configuration file (OpenTracing compatible). See https://gatsby.dev/tracing`,
        })
        // log-pages and write-to-file are specific to experimental GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES feature
        // because of that they are hidden from `--help` but still defined so `yargs` know about them
        .option(`log-pages`, {
          type: `boolean`,
          default: false,
          describe: `Log the pages that changes since last build (only available when using GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES).`,
          hidden: true,
        })
        .option(`write-to-file`, {
          type: `boolean`,
          default: false,
          describe: `Save the log of changed pages for future comparison (only available when using GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES).`,
          hidden: true,
        }),
    handler: handlerP(
      getCommandHandler(`build`, (args: yargs.Arguments, cmd: Function) => {
        process.env.NODE_ENV = `production`
        return cmd(args)
      })
    ),
  })

  cli.command({
    command: `serve`,
    describe: `Serve previously built Gatsby site.`,
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
    describe: `Get environment information for debugging and issue reporting`,
    builder: _ =>
      _.option(`C`, {
        alias: `clipboard`,
        type: `boolean`,
        default: false,
        describe: `Automagically copy environment information to clipboard`,
      }),
    handler: (args: yargs.Arguments) => {
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
    describe: `Wipe the local gatsby environment including built assets and cache`,
    handler: getCommandHandler(`clean`),
  })

  cli.command({
    command: `repl`,
    describe: `Get a node repl with context of Gatsby environment, see (https://www.gatsbyjs.org/docs/gatsby-repl/)`,
    handler: getCommandHandler(
      `repl`,
      (args: yargs.Arguments, cmd: Function) => {
        process.env.NODE_ENV = process.env.NODE_ENV || `development`
        return cmd(args)
      }
    ),
  })

  cli.command({
    command: `recipes [recipe]`,
    describe: `[EXPERIMENTAL] Run a recipe`,
    builder: _ =>
      _.option(`D`, {
        alias: `develop`,
        type: `boolean`,
        default: false,
        describe: `Start recipe in develop mode to live-develop your recipe (defaults to false)`,
      }).option(`I`, {
        alias: `install`,
        type: `boolean`,
        default: false,
        describe: `Install recipe (defaults to plan mode)`,
      }),
    handler: handlerP(
      async ({
        recipe,
        develop,
        install,
      }: yargs.Arguments<{
        recipe: string | undefined
        develop: boolean
        install: boolean
      }>) => {
        await recipesHandler(siteInfo.directory, recipe, develop, install)
      }
    ),
  })
}

function isLocalGatsbySite(): boolean {
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

function getVersionInfo(): string {
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

export const createCli = (argv: string[]): yargs.Arguments => {
  const cli = yargs(argv).parserConfiguration({
    "boolean-negation": false,
  })

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
      describe: `Create new Gatsby project.`,
      handler: handlerP(async ({ rootPath, starter }) => {
        const starterStr = starter ? String(starter) : undefined
        const rootPathStr = rootPath ? String(rootPath) : undefined

        await initStarter(starterStr, rootPathStr)
      }),
    })
    .command(`plugin`, `Useful commands relating to Gatsby plugins`, yargs =>
      yargs
        .command({
          command: `docs`,
          describe: `Helpful info about using and creating plugins`,
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
- Source Plugin Tutorial (https://www.gatsbyjs.org/tutorial/source-plugin-tutorial/)
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
      describe: `Enable or disable Gatsby anonymous analytics collection.`,
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

      handler: handlerP(({ enable, disable }: yargs.Arguments) => {
        const enabled = enable || !disable
        setTelemetryEnabled(enabled)
        report.log(`Telemetry collection ${enabled ? `enabled` : `disabled`}`)
      }),
    })
    .wrap(cli.terminalWidth())
    .demandCommand(1, `Pass --help to see all available commands and options.`)
    .strict()
    .recommendCommands()
    .parse(argv.slice(2))
}
