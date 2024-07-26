import _ from "lodash"
import semver from "semver"

// Defines the type of command for which an experiment runs
type executingCommand = "build" | "develop" | "all"

export const satisfiesSemvers = (
  semverConstraints: Record<string, string>
): boolean =>
  // Check each semver constraint for the flag.
  // If any are false, then the flag doesn't pass
  _.toPairs(semverConstraints).every(([packageName, semverConstraint]) => {
    let packageVersion: string
    try {
      packageVersion = require(`${packageName}/package.json`).version
    } catch (e) {
      return false
    }

    return semver.satisfies(packageVersion, semverConstraint, {
      includePrerelease: true,
    })
  })

export type fitnessEnum = true | false | "OPT_IN" | "LOCKED_IN"

export interface IFlag {
  name: string
  env: string
  description: string
  command: executingCommand
  /**
   * Use string identifier to track enabled flag or false to disable any tracking (useful when flag becomes new defaults)
   */
  telemetryId: string | false
  // Heuristics for deciding if a flag is experimental:
  // - there are known bugs most people will encounter and that block being
  // able to use Gatsby normally
  // - very few people have tested the feature so we're not sure if we've
  // uncovered even common problems.
  //
  // Flags should start as experimental but once all serious known bugs are
  // resolved and ~50+ people have tested it, experimental should be set to
  // false.
  experimental: boolean
  /**
   * True means conditions for the feature are met and can be opted in by user.
   *
   * False means it'll be disabled despite the user setting it true e.g.
   * it just won't work e.g. it doesn't have new enough version for something.
   *
   * OPT_IN means the gatsby will enable the flag (unless the user explicitly
   * disables it.
   *
   * LOCKED_IN means that feature is enabled always (unless `noCI` condition is met).
   * This is mostly to provide more meaningful terminal messages instead of removing
   * flag from the flag list when users has the flag set in configuration
   * (avoids showing unknown flag message and shows "no longer needed" message).
   */
  testFitness: (flag: IFlag) => fitnessEnum
  /**
   * Human-readable text explaining requirements for this feature to be available
   * (e.g. requires Node 14+)
   *
   * It is shown to users when testFitness() returns `false` but flag is set in gatsby-config.js
   */
  requires?: string
  includedFlags?: Array<string>
  umbrellaIssue?: string
  noCI?: boolean
}

const activeFlags: Array<IFlag> = [
  {
    name: `FAST_DEV`,
    env: `GATSBY_EXPERIMENTAL_FAST_DEV`,
    command: `develop`,
    telemetryId: `FastDev`,
    experimental: false,
    description: `Enable all experiments aimed at improving develop server start time & develop DX.`,
    includedFlags: [`DEV_SSR`, `PRESERVE_FILE_DOWNLOAD_CACHE`],
    testFitness: (): fitnessEnum => true,
  },
  {
    name: `DEV_SSR`,
    env: `GATSBY_EXPERIMENTAL_DEV_SSR`,
    command: `develop`,
    telemetryId: `DevSsr`,
    experimental: false,
    description: `Server Side Render (SSR) pages on full reloads during develop. Helps you detect SSR bugs and fix them without needing to do full builds.`,
    umbrellaIssue: `https://gatsby.dev/dev-ssr-feedback`,
    testFitness: (): fitnessEnum => true,
  },
  {
    name: `PRESERVE_FILE_DOWNLOAD_CACHE`,
    env: `GATSBY_EXPERIMENTAL_PRESERVE_FILE_DOWNLOAD_CACHE`,
    command: `all`,
    telemetryId: `PreserveFileDownloadCache`,
    experimental: false,
    description: `Don't delete the downloaded files cache when changing gatsby-node.js & gatsby-config.js files.`,
    umbrellaIssue: `https://gatsby.dev/cache-clearing-feedback`,
    testFitness: (): fitnessEnum => true,
  },
  {
    name: `PARALLEL_SOURCING`,
    env: `GATSBY_EXPERIMENTAL_PARALLEL_SOURCING`,
    command: `all`,
    telemetryId: `ParallelSourcing`,
    experimental: true,
    description: `Run all source plugins at the same time instead of serially. For sites with multiple source plugins, this can speedup sourcing and transforming considerably.`,
    umbrellaIssue: `https://gatsby.dev/parallel-sourcing-feedback`,
    testFitness: (): fitnessEnum => true,
  },
  {
    name: `DETECT_NODE_MUTATIONS`,
    env: `GATSBY_DETECT_NODE_MUTATIONS`,
    command: `all`,
    telemetryId: `DetectNodeMutations`,
    description: `Diagnostic mode to log any attempts to mutate node directly. Helpful when debugging missing data problems. See https://gatsby.dev/debugging-missing-data for more details.`,
    experimental: false,
    testFitness: (): fitnessEnum => true,
  },
  {
    name: `PARTIAL_HYDRATION`,
    env: `GATSBY_PARTIAL_HYDRATION`,
    command: `build`,
    telemetryId: `PartialHydration`,
    description: `Enable partial hydration to reduce Total Blocking Time and Time To Interactive.`,
    umbrellaIssue: `https://gatsby.dev/partial-hydration-umbrella-issue`,
    experimental: true,
    testFitness: (): fitnessEnum => {
      const v18Constraint = {
        react: `>=18.0.0`,
      }
      const v0Constraint = {
        react: `^0.0.0`,
      }

      return (
        _CFLAGS_.GATSBY_MAJOR === `5` &&
        (satisfiesSemvers(v18Constraint) || satisfiesSemvers(v0Constraint))
      )
    },
    requires:
      Number(_CFLAGS_.GATSBY_MAJOR) < 5
        ? `Partial hydration is only available in Gatsby V5. Please upgrade Gatsby.`
        : `Partial hydration requires React 18+ to work.`,
  },
  {
    name: `DISABLE_PARCEL_FOR_CONFIG`,
    env: `GATSBY_DISABLE_PARCEL_FOR_CONFIG`,
    command: `all`,
    telemetryId: `DisableParcelForConfig`,
    experimental: true,
    description: `Prevent Parcel from processing gatsby-config and gatsby-node files to improve build times.`,
    umbrellaIssue: `https://github.com/gatsbyjs/gatsby/issues/38948`,
    testFitness: (): fitnessEnum => {
      const fs = require(`fs-extra`)
      const semver = require(`semver`)
      const path = require(`path`)
      const os = require(`os`)

      const logger = console

      try {
        // Utility function for version checking
        const checkVersion = (
          packageName: string,
          versionConstraint: string
        ): boolean => {
          try {
            const version = require(`${packageName}/package.json`).version
            return semver.satisfies(version, versionConstraint)
          } catch (error) {
            logger.warn(`${packageName} not found or version check failed.`)
            return false
          }
        }

        // Check Parcel version
        if (!checkVersion(`parcel`, `>=2.0.0`)) {
          logger.warn(`Parcel version is not compatible. Required: >=2.0.0`)
          return false
        }

        // Check Gatsby version
        if (!checkVersion(`gatsby`, `>=4.0.0`)) {
          logger.warn(`Gatsby version is not compatible. Required: >=4.0.0`)
          return false
        }

        // Load and validate gatsby-config.js
        const gatsbyConfigPath = path.resolve(process.cwd(), `gatsby-config.js`)
        if (!fs.pathExistsSync(gatsbyConfigPath)) {
          logger.warn(
            `gatsby-config.js not found. Ensure it exists in the project root.`
          )
          return false
        }

        let gatsbyConfig
        try {
          gatsbyConfig = require(gatsbyConfigPath)
          if (typeof gatsbyConfig === `function`) {
            gatsbyConfig = gatsbyConfig()
          }
        } catch (error) {
          logger.warn(`Error loading gatsby-config.js:`, error.message)
          return false
        }

        if (!gatsbyConfig || typeof gatsbyConfig !== `object`) {
          logger.warn(
            `Invalid gatsby-config.js structure. Ensure it exports a valid object.`
          )
          return false
        }

        // Check if Parcel is enabled
        const isParcelEnabled =
          gatsbyConfig.flags && gatsbyConfig.flags.PARCEL === true
        if (!isParcelEnabled) {
          logger.warn(
            `Parcel is not enabled in gatsby-config.js. Please enable it to use this feature.`
          )
          return false
        }

        // Validate gatsby-node.js
        const gatsbyNodePath = path.resolve(process.cwd(), `gatsby-node.js`)
        if (!fs.pathExistsSync(gatsbyNodePath)) {
          logger.warn(
            `gatsby-node.js not found. It's required for this feature.`
          )
          return false
        }

        try {
          require(gatsbyNodePath)
        } catch (error) {
          logger.warn(`Error loading gatsby-node.js:`, error.message)
          return false
        }

        // Check system resources
        const totalMemory = os.totalmem()
        const freeMemory = os.freemem()
        const cpuCount = os.cpus().length

        if (freeMemory < 2 * 1024 * 1024 * 1024 || cpuCount < 4) {
          logger.warn(
            `Insufficient system resources. At least 2GB free memory and 4 CPU cores are required.`
          )
          return false
        }

        // Check for conflicting plugins
        const plugins = gatsbyConfig.plugins || []
        const conflictingPlugins = plugins.filter(
          plugin =>
            (typeof plugin === `string` && plugin.includes(`parcel`)) ||
            (typeof plugin === `object` &&
              plugin.resolve &&
              plugin.resolve.includes(`parcel`))
        )
        if (conflictingPlugins.length > 0) {
          logger.warn(
            `Potential conflicts detected with plugins:`,
            conflictingPlugins
          )
          return false
        }

        // Check for necessary dependencies
        const requiredDeps = [`react`, `react-dom`]
        for (const dep of requiredDeps) {
          if (!checkVersion(dep, `>=16.9.0`)) {
            logger.warn(`${dep} version >=16.9.0 is required. Please update.`)
            return false
          }
        }

        // Check for development environment
        if (process.env.NODE_ENV !== `production`) {
          logger.warn(
            `This feature is recommended for production builds only. Current environment: ` +
              process.env.NODE_ENV
          )
          return false
        }

        // All checks passed
        logger.info(
          `All checks passed. DISABLE_PARCEL_FOR_CONFIG is ready to be used.`
        )
        return true
      } catch (error) {
        logger.error(
          `Unexpected error in DISABLE_PARCEL_FOR_CONFIG testFitness:`,
          error
        )
        return false
      }
    },
    requires: `Parcel 2.0.0+, Gatsby 4.0.0+, React 16.9.0+, enabled Parcel in gatsby-config.js, valid gatsby-node.js, sufficient system resources (4+ CPU cores, 2GB+ free memory), and production environment.`,
  }, // Ensure this comma is here to avoid parsing errors
] // End of Selection
