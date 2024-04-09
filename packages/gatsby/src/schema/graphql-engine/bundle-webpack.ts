/* eslint-disable @typescript-eslint/naming-convention */

import * as path from "path"
import * as fs from "fs-extra"
import execa, { Options as ExecaOptions } from "execa"
import webpack, { Module, NormalModule, Compilation } from "webpack"
import ConcatenatedModule from "webpack/lib/optimize/ConcatenatedModule"
import { dependencies } from "gatsby/package.json"
import { printQueryEnginePlugins } from "./print-plugins"
import mod from "module"
import { WebpackLoggingPlugin } from "../../utils/webpack/plugins/webpack-logging"
import { getAssetMeta } from "@vercel/webpack-asset-relocator-loader"
import reporter from "gatsby-cli/lib/reporter"
import { schemaCustomizationAPIs } from "./print-plugins"
import type { GatsbyNodeAPI } from "../../redux/types"
import * as nodeApis from "../../utils/api-node-docs"
import { store } from "../../redux"
import { PackageJson } from "../../.."
import { slash } from "gatsby-core-utils/path"
import { isEqual } from "lodash"
import {
  IPlatformAndArch,
  getCurrentPlatformAndTarget,
  getFunctionsTargetPlatformAndTarget,
} from "../../utils/engines-helpers"

type Reporter = typeof reporter

const extensions = [`.mjs`, `.js`, `.json`, `.node`, `.ts`, `.tsx`]

const outputDir = path.posix.join(
  slash(process.cwd()),
  `.cache`,
  `query-engine`
)
const cacheLocation = path.posix.join(
  slash(process.cwd()),
  `.cache`,
  `webpack`,
  `query-engine`
)

function getApisToRemoveForQueryEngine(): Array<GatsbyNodeAPI> {
  const apisToKeep = new Set(schemaCustomizationAPIs)
  apisToKeep.add(`onPluginInit`)

  const apisToRemove = (Object.keys(nodeApis) as Array<GatsbyNodeAPI>).filter(
    api => !apisToKeep.has(api)
  )
  return apisToRemove
}

const getInternalPackagesCacheDir = (
  functionsTarget: IPlatformAndArch
): string =>
  path.posix.join(
    slash(process.cwd()),
    `.cache`,
    `internal-packages`,
    `${functionsTarget.platform}-${functionsTarget.arch}`
  )

// Create a directory and JS module where we install internally used packages
const createInternalPackagesCacheDir = async (
  functionsTarget: IPlatformAndArch
): Promise<void> => {
  const cacheDir = getInternalPackagesCacheDir(functionsTarget)
  await fs.ensureDir(cacheDir)

  const packageJsonPath = path.join(cacheDir, `package.json`)

  if (!fs.existsSync(packageJsonPath)) {
    await fs.emptyDir(cacheDir)

    await fs.outputJson(packageJsonPath, {
      name: `gatsby-internal-packages`,
      description: `This directory contains internal packages installed by Gatsby used to comply with the current platform requirements`,
      version: `1.0.0`,
      private: true,
      author: `Gatsby`,
      license: `MIT`,
      functionsTarget,
    })
  }
}

function getLMDBBinaryFromSiteLocation(
  lmdbPackageName: string,
  version: string,
  functionsTarget: IPlatformAndArch
): string | undefined {
  // Read lmdb's package.json, go through its optional depedencies and validate if there's a prebuilt lmdb module with a compatible binary to our platform and arch
  let packageJson: PackageJson
  try {
    const modulePath = path
      .dirname(slash(require.resolve(`lmdb`)))
      .replace(`/dist`, ``)
    const packageJsonPath = path.join(modulePath, `package.json`)
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, `utf-8`))
  } catch (e) {
    // If we fail to read lmdb's package.json there's bigger problems here so just skip installation
    return undefined
  }
  // If there's no lmdb prebuilt package for our arch/platform listed as optional dep no point in trying to install it
  const { optionalDependencies = {} } = packageJson
  if (!Object.keys(optionalDependencies).find(p => p === lmdbPackageName)) {
    throw new Error(
      `Target platform/arch for functions execution (${functionsTarget.platform}/${functionsTarget.arch}) is not supported.`
    )
  }
  return getPackageLocationFromRequireContext(
    slash(require.resolve(`lmdb`)),
    lmdbPackageName,
    version
  )
}

function getPackageLocationFromRequireContext(
  location: string,
  packageName: string,
  packageVersion?: string
): string | undefined {
  try {
    const requireId = `${packageName}/package.json`
    const locationRequire = mod.createRequire(location)
    const packageJsonLocation = slash(locationRequire.resolve(requireId))

    if (packageVersion) {
      // delete locationRequire.cache[requireId]
      const { version } = JSON.parse(
        fs.readFileSync(packageJsonLocation, `utf-8`)
      )
      if (packageVersion !== version) {
        return undefined
      }
    }

    return path.dirname(packageJsonLocation)
  } catch (e) {
    return undefined
  }
}

interface ILMDBBinaryPackageStatusBase {
  packageName: string
  needToInstall: boolean
  packageVersion: string
}

interface ILMDBBinaryPackageStatusInstalled
  extends ILMDBBinaryPackageStatusBase {
  needToInstall: false
  packageLocation: string
}

interface ILMDBBinaryPackageStatusNeedAlternative
  extends ILMDBBinaryPackageStatusBase {
  needToInstall: true
}

type IBinaryPackageStatus =
  | ILMDBBinaryPackageStatusInstalled
  | ILMDBBinaryPackageStatusNeedAlternative

function checkIfInstalledInInternalPackagesCache(
  packageStatus: IBinaryPackageStatus,
  functionsTarget: IPlatformAndArch
): IBinaryPackageStatus {
  const cacheDir = getInternalPackagesCacheDir(functionsTarget)

  const packageLocationFromInternalPackageCache =
    getPackageLocationFromRequireContext(
      path.posix.join(cacheDir, `:internal:`),
      packageStatus.packageName,
      packageStatus.packageVersion
    )

  if (
    packageLocationFromInternalPackageCache &&
    !path.posix
      .relative(cacheDir, packageLocationFromInternalPackageCache)
      .startsWith(`..`)
  ) {
    return {
      ...packageStatus,
      needToInstall: false,
      packageLocation: packageLocationFromInternalPackageCache,
    }
  }

  return {
    ...packageStatus,
    needToInstall: true,
  }
}

// Install lmdb's native system module under our internal cache if we detect the current installation
// isn't using the pre-build binaries
function checkIfNeedToInstallMissingLmdb(
  functionsTarget: IPlatformAndArch
): IBinaryPackageStatus {
  // lmdb module with prebuilt binaries for target platform
  const lmdbPackageName = `@lmdb/lmdb-${functionsTarget.platform}-${functionsTarget.arch}`

  const lmdbBinaryFromSiteLocation = getLMDBBinaryFromSiteLocation(
    lmdbPackageName,
    dependencies.lmdb,
    functionsTarget
  )

  const sharedPackageStatus: ILMDBBinaryPackageStatusNeedAlternative = {
    needToInstall: true,
    packageName: lmdbPackageName,
    packageVersion: dependencies.lmdb,
  }

  if (lmdbBinaryFromSiteLocation) {
    return {
      ...sharedPackageStatus,
      needToInstall: false,
      packageLocation: lmdbBinaryFromSiteLocation,
    }
  }

  return checkIfInstalledInInternalPackagesCache(
    sharedPackageStatus,
    functionsTarget
  )
}

function checkIfNeedToInstallMissingSharp(
  functionsTarget: IPlatformAndArch,
  currentTarget: IPlatformAndArch
): IBinaryPackageStatus | undefined {
  try {
    // check if shapr is resolvable
    const { version: sharpVersion } = require(`sharp/package.json`)

    if (isEqual(functionsTarget, currentTarget)) {
      return undefined
    }

    return checkIfInstalledInInternalPackagesCache(
      {
        needToInstall: true,
        packageName: `sharp`,
        packageVersion: sharpVersion,
      },
      functionsTarget
    )
  } catch (e) {
    return undefined
  }
}

async function installMissing(
  packages: Array<IBinaryPackageStatus | undefined>,
  functionsTarget: IPlatformAndArch
): Promise<Array<IBinaryPackageStatus | undefined>> {
  function shouldInstall(
    p: IBinaryPackageStatus | undefined
  ): p is IBinaryPackageStatus {
    return Boolean(p?.needToInstall)
  }

  const packagesToInstall = packages.filter(shouldInstall)

  if (packagesToInstall.length === 0) {
    return packages
  }

  await createInternalPackagesCacheDir(functionsTarget)

  const cacheDir = getInternalPackagesCacheDir(functionsTarget)

  const options: ExecaOptions = {
    stderr: `inherit`,
    cwd: cacheDir,
    env: {
      npm_config_arch: functionsTarget.arch,
      npm_config_platform: functionsTarget.platform,
    },
  }

  const npmAdditionalCliArgs = [
    `--no-progress`,
    `--no-audit`,
    `--no-fund`,
    `--loglevel`,
    `error`,
    `--color`,
    `always`,
    `--legacy-peer-deps`,
    `--save-exact`,
    // target platform might be different than current and force allows us to install it
    `--force`,
  ]

  await execa(
    `npm`,
    [
      `install`,
      ...npmAdditionalCliArgs,
      ...packagesToInstall.map(p => `${p.packageName}@${p.packageVersion}`),
    ],
    options
  )

  return packages.map(info =>
    info
      ? info.needToInstall
        ? {
            ...info,
            needToInstall: false,
            packageLocation: path.posix.join(
              cacheDir,
              `node_modules`,
              info.packageName
            ),
          }
        : info
      : undefined
  )
}

export async function createGraphqlEngineBundle(
  rootDir: string,
  reporter: Reporter,
  isVerbose?: boolean
): Promise<webpack.Compilation | undefined> {
  const state = store.getState()
  const pathPrefix = state.program.prefixPaths
    ? state.config.pathPrefix ?? ``
    : ``

  const schemaSnapshotString = await fs.readFile(
    path.join(rootDir, `.cache`, `schema.gql`),
    `utf-8`
  )
  await printQueryEnginePlugins()

  const assetRelocatorUseEntry = {
    loader: require.resolve(`@vercel/webpack-asset-relocator-loader`),
    options: {
      outputAssetBase: `assets`,
    },
  }

  const gatsbyPluginTSRequire = mod.createRequire(
    require.resolve(`gatsby-plugin-typescript`)
  )

  const currentTarget = getCurrentPlatformAndTarget()
  const functionsTarget = getFunctionsTargetPlatformAndTarget()

  const dynamicAliases: Record<string, string> = {}
  let forcedLmdbBinaryModule: string | undefined = undefined

  // we need to make sure we have internal packages cache directory setup for current lambda target
  // before we attempt to check if we can reuse those packages
  await createInternalPackagesCacheDir(functionsTarget)

  const [lmdbPackageInfo, sharpPackageInfo] = await installMissing(
    [
      checkIfNeedToInstallMissingLmdb(functionsTarget),
      checkIfNeedToInstallMissingSharp(functionsTarget, currentTarget),
    ],
    functionsTarget
  )

  if (!lmdbPackageInfo) {
    throw new Error(`Failed to find required LMDB binary`)
  } else if (functionsTarget.platform === `linux`) {
    // function execution platform is primarily linux, which is tested the most, so we only force that specific binary
    // to not cause untested code paths
    if (lmdbPackageInfo.needToInstall) {
      throw new Error(
        `Failed to locate or install LMDB binary for functions execution platform/arch (${functionsTarget.platform}/${functionsTarget.arch})`
      )
    }

    forcedLmdbBinaryModule = `${lmdbPackageInfo.packageLocation}/node.abi83.glibc.node`
  }

  if (sharpPackageInfo) {
    if (sharpPackageInfo.needToInstall) {
      throw new Error(
        `Failed to locate or install Sharp binary for functions execution platform/arch (${functionsTarget.platform}/${functionsTarget.arch})`
      )
    }
    dynamicAliases[`sharp$`] = sharpPackageInfo.packageLocation
  }

  const compiler = webpack({
    name: `Query Engine`,
    // mode: `production`,
    mode: `none`,
    entry: path.join(__dirname, `entry.js`),
    output: {
      path: outputDir,
      filename: `index.js`,
      libraryTarget: `commonjs`,
    },
    target: `node`,
    externalsPresets: {
      node: false,
    },
    cache: {
      type: `filesystem`,
      name: `graphql-engine`,
      cacheLocation,
      buildDependencies: {
        config: [__filename],
      },
      version: JSON.stringify(functionsTarget),
    },
    // those are required in some runtime paths, but we don't need them
    externals: [
      `cbor-x`, // optional dep of lmdb-store, but we are using `msgpack` (default) encoding, so we don't need it
      `electron`, // :shrug: `got` seems to have electron specific code path
      mod.builtinModules.reduce((acc, builtinModule) => {
        if (builtinModule === `fs`) {
          acc[builtinModule] = `global _actualFsWrapper`
          acc[`node:${builtinModule}`] = `global _actualFsWrapper`
        } else {
          acc[builtinModule] = `commonjs ${builtinModule}`
          acc[`node:${builtinModule}`] = `commonjs ${builtinModule}`
        }

        return acc
      }, {}),
    ],
    module: {
      rules: [
        {
          oneOf: [
            {
              // specific set of loaders for sharp
              test: /node_modules[/\\]sharp[/\\].*\.[cm]?js$/,
              // it is recommended for Node builds to turn off AMD support
              parser: { amd: false },
              use: [
                assetRelocatorUseEntry,
                {
                  loader: require.resolve(`./sharp-bundling-patch`),
                },
              ],
            },
            {
              // specific set of loaders for LMBD - our custom patch to massage lmdb to work with relocator -> relocator
              test: /node_modules[/\\]lmdb[/\\].*\.[cm]?js/,
              // it is recommended for Node builds to turn off AMD support
              parser: { amd: false },
              use: [
                assetRelocatorUseEntry,
                {
                  loader: require.resolve(`./lmdb-bundling-patch`),
                  options: {
                    forcedBinaryModule: forcedLmdbBinaryModule,
                  },
                },
              ],
            },
            {
              // specific set of loaders for gatsby-node files - our babel transform that removes lifecycles not needed for engine -> relocator
              test: /gatsby-node\.(cjs|mjs|js|ts)$/,
              // it is recommended for Node builds to turn off AMD support
              parser: { amd: false },
              use: [
                assetRelocatorUseEntry,
                {
                  loader: require.resolve(
                    `../../utils/webpack/loaders/webpack-remove-exports-loader`
                  ),
                  options: {
                    remove: getApisToRemoveForQueryEngine(),
                    jsx: false,
                  },
                },
              ],
            },
            {
              // generic loader for all other cases than lmdb or gatsby-node - we don't do anything special other than using relocator on it
              // For node binary relocations, include ".node" files as well here
              test: /\.(cjs|mjs|js|ts|node)$/,
              // it is recommended for Node builds to turn off AMD support
              parser: { amd: false },
              use: assetRelocatorUseEntry,
            },
          ],
        },
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: require.resolve(`babel-loader`),
            options: {
              presets: [
                gatsbyPluginTSRequire.resolve(`@babel/preset-typescript`),
              ],
            },
          },
        },
        {
          test: /\.m?js$/,
          type: `javascript/auto`,
          resolve: {
            byDependency: {
              esm: {
                fullySpecified: false,
              },
            },
          },
        },
        {
          test: /\.txt/,
          type: `asset/resource`,
        },
        {
          test: /\.(graphqls?|gqls?)$/,
          use: {
            loader: require.resolve(`graphql-tag/loader`),
          },
        },
      ],
    },
    resolve: {
      extensions,
      alias: {
        ...dynamicAliases,
        ".cache": process.cwd() + `/.cache/`,

        [require.resolve(`gatsby-cli/lib/reporter/loggers/ink/index.js`)]:
          false,
        inquirer: false,
        // only load one version of lmdb
        lmdb: require.resolve(`lmdb`),
        "ts-node": require.resolve(`./shims/ts-node`),
        "gatsby-sharp$": require.resolve(`./shims/gatsby-sharp`),
        "graphql-import-node$": require.resolve(`./shims/no-op-module`),
        "graphql-import-node/register$":
          require.resolve(`./shims/no-op-module`),
        "babel-runtime/helpers/asyncToGenerator":
          require.resolve(`./shims/no-op-module`), // undeclared dep of yurnalist (but used in code path we don't use)
      },
    },
    plugins: [
      new webpack.EnvironmentPlugin([`GATSBY_CLOUD_IMAGE_CDN`]),
      new webpack.DefinePlugin({
        "process.env.GATSBY_SKIP_WRITING_SCHEMA_TO_FILE": `true`,
        "process.env.NODE_ENV": JSON.stringify(`production`),
        SCHEMA_SNAPSHOT: JSON.stringify(schemaSnapshotString),
        PATH_PREFIX: JSON.stringify(pathPrefix),
        "process.env.GATSBY_LOGGER": JSON.stringify(`yurnalist`),
        "process.env.GATSBY_SLICES": JSON.stringify(
          !!process.env.GATSBY_SLICES
        ),
        "process.env.GATSBY_FUNCTIONS_PLATFORM": JSON.stringify(
          functionsTarget.platform
        ),
        "process.env.GATSBY_FUNCTIONS_ARCH": JSON.stringify(
          functionsTarget.arch
        ),
      }),
      process.env.GATSBY_WEBPACK_LOGGING?.includes(`query-engine`) &&
        new WebpackLoggingPlugin(rootDir, reporter, isVerbose),
    ].filter(Boolean) as Array<webpack.WebpackPluginInstance>,
  })

  return new Promise((resolve, reject) => {
    compiler.run(async (err, stats): Promise<void> => {
      function getResourcePath(
        webpackModule?: Module | NormalModule | ConcatenatedModule | null
      ): string | undefined {
        if (webpackModule && !(webpackModule instanceof ConcatenatedModule)) {
          return (webpackModule as NormalModule).resource
        }

        if (webpackModule?.modules) {
          // ConcatenatedModule is a collection of modules so we have to go deeper to actually get a path,
          // at this point we won't know which one so we just grab first module here
          const [firstSubModule] = webpackModule.modules
          return getResourcePath(firstSubModule)
        }

        return undefined
      }

      function iterateModules(
        webpackModules: Set<Module>,
        compilation: Compilation
      ): void {
        for (const webpackModule of webpackModules) {
          if (webpackModule instanceof ConcatenatedModule) {
            iterateModules(
              (webpackModule as ConcatenatedModule).modules,
              compilation
            )
          } else {
            const resourcePath = getResourcePath(webpackModule)
            if (resourcePath?.includes(`ts-node`)) {
              const importedBy = getResourcePath(
                compilation.moduleGraph.getIssuer(webpackModule)
              )
              const structuredError = {
                id: `98011`,
                context: {
                  package: `ts-node`,
                  importedBy,
                  advisory: `Gatsby is supporting TypeScript natively (see https://gatsby.dev/typescript). "ts-node" might not be needed anymore at all, consider removing it.`,
                },
              }
              throw structuredError
            }
          }
        }
      }

      try {
        if (stats?.compilation.modules) {
          iterateModules(stats.compilation.modules, stats.compilation)
        }

        if (!isEqual(functionsTarget, currentTarget)) {
          const binaryFixingPromises: Array<Promise<void>> = []
          // sigh - emitAsset used by relocator seems to corrupt binaries
          // resulting in "ELF file's phentsize not the expected size" errors
          // - see size diff
          //   > find . -name node.abi83.glibc.node
          // ./.cache/internal-packages/node_modules/@lmdb/lmdb-linux-x64/node.abi83.glibc.node
          // ./.cache/query-engine/assets/node.abi83.glibc.node
          // > ls -al ./.cache/query-engine/assets/node.abi83.glibc.node
          // -rw-r--r-- 1 misiek 197121 1285429 Mar 14 11:36 ./.cache/query-engine/assets/node.abi83.glibc.node
          // > ls -al ./.cache/internal-packages/node_modules/@lmdb/lmdb-linux-x64/node.abi83.glibc.node
          // -rw-r--r-- 1 misiek 197121 693544 Mar 14 11:35 ./.cache/internal-packages/node_modules/@lmdb/lmdb-linux-x64/node.abi83.glibc.node
          // so this tries to fix it by straight copying it over
          for (const asset of (
            stats?.compilation?.assetsInfo ?? new Map()
          ).keys()) {
            if (asset?.endsWith(`.node`)) {
              const targetRelPath = path.posix.relative(`assets`, asset)
              const assetMeta = getAssetMeta(targetRelPath, stats?.compilation)
              const sourcePath = assetMeta?.path
              if (sourcePath) {
                const dist = path.join(outputDir, asset)
                binaryFixingPromises.push(fs.copyFile(sourcePath, dist))
              }
            }
          }

          await Promise.all(binaryFixingPromises)
        }

        compiler.close(closeErr => {
          if (err) {
            return reject(err)
          }
          if (closeErr) {
            return reject(closeErr)
          }
          return resolve(stats?.compilation)
        })
      } catch (e) {
        reject(e)
      }
    })
  })
}
