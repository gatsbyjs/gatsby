import crypto from "crypto";
import fs from "fs-extra";
import path from "path";
import dotenv from "dotenv";
import { CoreJSResolver } from "./webpack/plugins/corejs-resolver";
import { CacheFolderResolver } from "./webpack/plugins/cache-folder-resolver";
import { store } from "../redux";
import { actions } from "../redux/actions";
import { getPublicPath } from "./get-public-path";
import reporter from "gatsby-cli/lib/reporter";
import { withBasePath, withTrailingSlash } from "./path";
import { getGatsbyDependents } from "./get-gatsby-dependents";
import { apiRunnerNode } from "./api-runner-node";
import { createWebpackUtils } from "./webpack-utils";
import { hasLocalEslint } from "./local-eslint-config-finder";
import { getAbsolutePathForVirtualModule } from "./gatsby-webpack-virtual-modules";
import { StaticQueryMapper } from "./webpack/plugins/static-query-mapper";
import { ForceCssHMRForEdgeCases } from "./webpack/plugins/force-css-hmr-for-edge-cases";
import { WebpackLoggingPlugin } from "./webpack/plugins/webpack-logging";
import { hasES6ModuleSupport } from "./browserslist";
// eslint-disable-next-line @typescript-eslint/naming-convention
import Module from "module";
import { shouldGenerateEngines } from "./engines-helpers";
import { ROUTES_DIRECTORY } from "../constants";
import { BabelConfigItemsCacheInvalidatorPlugin } from "./babel-loader";
import { PartialHydrationPlugin } from "./webpack/plugins/partial-hydration";
import { resolveJSFilepath } from "../bootstrap/resolve-js-file-path";
import webpack from "webpack";
import type { IProgram, Stage } from "../internal";
// eslint-disable-next-line @typescript-eslint/naming-convention
import _debug from "debug";
import { Span, SpanContext } from "opentracing";

const debug = _debug("gatsby:webpack-config");
const FRAMEWORK_BUNDLES = ["react", "react-dom", "scheduler", "prop-types"];

// This regex ignores nested copies of framework libraries so they're bundled with their issuer
const FRAMEWORK_BUNDLES_REGEX = new RegExp(
  `(?<!node_modules.*)[\\\\/]node_modules[\\\\/](${FRAMEWORK_BUNDLES.join(
    "|",
  )})[\\\\/]`,
);

// Four stages or modes:
//   1) develop: for `gatsby develop` command, hot reload and CSS injection into page
//   2) develop-html: same as develop without react-hmre in the babel config for html renderer
//   3) build-javascript: Build JS and CSS chunks for production
//   4) build-html: build all HTML files

export async function webpackConfig(
  program: IProgram,
  directory: string,
  suppliedStage: Stage,
  _port: number | undefined,
  { parentSpan }: { parentSpan?: Span | SpanContext | undefined } = {},
  nonce?: string | undefined,
): Promise<webpack.Configuration> {
  let fastRefreshPlugin: webpack.WebpackPluginInstance | undefined;

  const modulesThatUseGatsby = await getGatsbyDependents();
  const directoryPath = withBasePath(directory);

  const { rules, loaders, plugins } = createWebpackUtils(
    suppliedStage,
    program,
  );

  const { assetPrefix, pathPrefix, trailingSlash } = store.getState().config;

  const publicPath = getPublicPath({ assetPrefix, pathPrefix, ...program });
  const isPartialHydrationEnabled =
    (process.env.GATSBY_PARTIAL_HYDRATION === "true" ||
      process.env.GATSBY_PARTIAL_HYDRATION === "1") &&
    _CFLAGS_.GATSBY_MAJOR === "5";

  function processEnv(
    stage: Stage,
    defaultNodeEnv,
  ): {
    "process.env": string;
  } {
    debug(`Building env for "${stage}"`);
    // node env should be DEVELOPMENT | PRODUCTION as these are commonly used in node land
    // this variable is used inside webpack
    const nodeEnv = process.env.NODE_ENV || `${defaultNodeEnv}`;
    // config env is dependent on the env that it's run, this can be anything from staging-production
    // this allows you to set use different .env environments or conditions in gatsby files
    const configEnv = process.env.GATSBY_ACTIVE_ENV || nodeEnv;
    const envFile = path.join(process.cwd(), `./.env.${configEnv}`);
    let parsed = {};
    try {
      parsed = dotenv.parse(fs.readFileSync(envFile, { encoding: "utf8" }));
    } catch (err) {
      if (err.code !== "ENOENT") {
        reporter.error(
          `There was a problem processing the .env file (${envFile})`,
          err,
        );
      }
    }

    const target =
      stage === "build-html" || stage === "develop-html" ? "node" : "web";

    const envObject: Record<string, string> = Object.keys(parsed).reduce(
      (acc, key) => {
        acc[key] = JSON.stringify(parsed[key]);
        return acc;
      },
      {},
    );

    const gatsbyVarObject = Object.keys(process.env).reduce((acc, key) => {
      if (target === "node" || key.match(/^GATSBY_/)) {
        acc[key] = JSON.stringify(process.env[key]);
      }
      return acc;
    }, {});

    // Don't allow overwriting of NODE_ENV, PUBLIC_DIR as to not break gatsby things
    envObject.NODE_ENV = JSON.stringify(nodeEnv);
    envObject.PUBLIC_DIR = JSON.stringify(`${process.cwd()}/public`);
    envObject.BUILD_STAGE = JSON.stringify(stage);
    envObject.CYPRESS_SUPPORT = JSON.stringify(process.env.CYPRESS_SUPPORT);
    envObject.GATSBY_QUERY_ON_DEMAND = JSON.stringify(
      !!process.env.GATSBY_QUERY_ON_DEMAND,
    );

    if (stage === "develop") {
      envObject.GATSBY_SOCKET_IO_DEFAULT_TRANSPORT = JSON.stringify(
        process.env.GATSBY_SOCKET_IO_DEFAULT_TRANSPORT || "websocket",
      );
    }

    const mergedEnvVars = Object.assign(envObject, gatsbyVarObject);

    return Object.keys(mergedEnvVars).reduce(
      (acc, key) => {
        acc[`process.env.${key}`] = mergedEnvVars[key];
        return acc;
      },
      {
        "process.env": "({})",
      },
    );
  }

  debug(`Loading webpack config for stage "${suppliedStage}"`);
  function getOutput():
    | {
        path: string;
        filename: string;
        // Add /* filename */ comments to generated require()s in the output.
        pathinfo: boolean;
        // Point sourcemap entries to original disk location (format as URL on Windows)
        publicPath: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        devtoolModuleFilenameTemplate: (info: any) => string;
        // Avoid React cross-origin errors
        // See https://reactjs.org/docs/cross-origin-errors.html
        crossOriginLoading: string;
        chunkFilename?: undefined;
        library?: undefined;
      }
    | {
        path: string;
        filename: string;
        chunkFilename: string;
        library: { type: string };
        publicPath: string;
        // Add /* filename */ comments to generated require()s in the output.
        pathinfo?: undefined;
        devtoolModuleFilenameTemplate?: undefined;
        // Avoid React cross-origin errors
        // See https://reactjs.org/docs/cross-origin-errors.html
        crossOriginLoading?: undefined;
      }
    | {
        filename: string;
        chunkFilename: string;
        path: string;
        publicPath: string;
        // Add /* filename */ comments to generated require()s in the output.
        pathinfo?: undefined;
        devtoolModuleFilenameTemplate?: undefined;
        // Avoid React cross-origin errors
        // See https://reactjs.org/docs/cross-origin-errors.html
        crossOriginLoading?: undefined;
        library?: undefined;
      } {
    switch (suppliedStage) {
      case "develop":
        return {
          path: directory,
          filename: "[name].js",
          // Add /* filename */ comments to generated require()s in the output.
          pathinfo: true,
          // Point sourcemap entries to original disk location (format as URL on Windows)
          publicPath: process.env.GATSBY_WEBPACK_PUBLICPATH || "/",
          devtoolModuleFilenameTemplate: (info) =>
            path.resolve(info.absoluteResourcePath).replace(/\\/g, "/"),
          // Avoid React cross-origin errors
          // See https://reactjs.org/docs/cross-origin-errors.html
          crossOriginLoading: "anonymous",
        };
      case "build-html":
      case "develop-html":
        // Generate the file needed to SSR pages.
        // Deleted by build-html.js, since it's not needed for production.
        return {
          path: directoryPath(ROUTES_DIRECTORY),
          filename: "[name].js",
          chunkFilename: "[name].js",
          library: {
            type: "commonjs",
          },
          publicPath: withTrailingSlash(publicPath),
        };
      case "build-javascript":
        return {
          filename: "[name]-[contenthash].js",
          chunkFilename: "[name]-[contenthash].js",
          path: directoryPath("public"),
          publicPath: withTrailingSlash(publicPath),
        };
      default:
        throw new Error(`The state requested ${suppliedStage} doesn't exist.`);
    }
  }

  function getEntry():
    | {
        commons: Array<string>;
        polyfill?: undefined;
        "render-page"?: undefined;
        app?: undefined;
      }
    | {
        polyfill: string;
        commons: Array<string>;
        "render-page"?: undefined;
        app?: undefined;
      }
    | {
        "render-page": string;
        commons?: undefined;
        polyfill?: undefined;
        app?: undefined;
      }
    | {
        app: string;
        commons?: undefined;
        polyfill?: undefined;
        "render-page"?: undefined;
      }
    | {
        polyfill: string;
        app: string;
        commons?: undefined;
        "render-page"?: undefined;
      } {
    switch (suppliedStage) {
      case "develop":
        return hasES6ModuleSupport(directory)
          ? {
              commons: [directoryPath(".cache/app")],
            }
          : {
              polyfill: directoryPath(".cache/polyfill-entry"),
              commons: [directoryPath(".cache/app")],
            };
      case "develop-html":
        return {
          "render-page": process.env.GATSBY_EXPERIMENTAL_DEV_SSR
            ? directoryPath(".cache/ssr-develop-static-entry")
            : directoryPath(".cache/develop-static-entry"),
        };
      case "build-html": {
        return {
          "render-page": directoryPath(".cache/static-entry"),
        };
      }
      case "build-javascript":
        return hasES6ModuleSupport(directory)
          ? {
              app: directoryPath(".cache/production-app"),
            }
          : {
              polyfill: directoryPath(".cache/polyfill-entry"),
              app: directoryPath(".cache/production-app"),
            };
      default:
        throw new Error(`The state requested ${suppliedStage} doesn't exist.`);
    }
  }

  function getPlugins(
    nonce?: string | undefined,
  ): Array<
    | webpack.WebpackPluginInstance
    | BabelConfigItemsCacheInvalidatorPlugin
    | WebpackLoggingPlugin
  > {
    let configPlugins = [
      plugins.moment(),

      // Add a few global variables. Set NODE_ENV to production (enables
      // optimizations for React) and what the link prefix is (__PATH_PREFIX__).
      plugins.define({
        ...processEnv(suppliedStage, "development"),
        __BASE_PATH__: JSON.stringify(program.prefixPaths ? pathPrefix : ""),
        __PATH_PREFIX__: JSON.stringify(program.prefixPaths ? publicPath : ""),
        __ASSET_PREFIX__: JSON.stringify(
          program.prefixPaths ? assetPrefix : "",
        ),
        __TRAILING_SLASH__: JSON.stringify(trailingSlash),
        // TODO Improve asset passing to pages
        BROWSER_ESM_ONLY: JSON.stringify(hasES6ModuleSupport(directory)),
        "global.hasPartialHydration": isPartialHydrationEnabled,
      }),

      plugins.virtualModules(),
      new BabelConfigItemsCacheInvalidatorPlugin(),
      process.env.GATSBY_WEBPACK_LOGGING?.split(",")?.includes(suppliedStage) &&
        new WebpackLoggingPlugin(program.directory, reporter, program.verbose),
    ].filter(Boolean);

    switch (suppliedStage) {
      case "develop": {
        fastRefreshPlugin =
          plugins.fastRefresh({ modulesThatUseGatsby }) ?? undefined;

        configPlugins = configPlugins.concat(
          [
            fastRefreshPlugin,
            new ForceCssHMRForEdgeCases(),
            plugins.hotModuleReplacement(),
            plugins.noEmitOnErrors(),
            new StaticQueryMapper(store),
          ].filter(Boolean),
        );

        const extractedTextPlugin = plugins.extractText({
          filename: "[name].css",
          chunkFilename: "[id].css",
        });

        if (extractedTextPlugin !== null) {
          configPlugins.push(extractedTextPlugin);
        }

        const extractedStats = plugins.extractStats(nonce);

        if (
          process.env.GATSBY_EXPERIMENTAL_DEV_SSR &&
          extractedStats !== null
        ) {
          configPlugins.push(extractedStats);
        }

        const isCustomEslint = hasLocalEslint(program.directory);

        // if no local eslint config, then add gatsby config
        if (!isCustomEslint) {
          const eslintPlugin = plugins.eslint();

          if (eslintPlugin !== null) {
            configPlugins.push(eslintPlugin);
          }
        }

        // Enforce fast-refresh rules even with local eslint config
        if (isCustomEslint) {
          const eslintRequiredPlugin = plugins.eslintRequired();

          if (eslintRequiredPlugin !== null) {
            configPlugins.push(eslintRequiredPlugin);
          }
        }

        break;
      }
      case "build-javascript": {
        configPlugins = configPlugins.concat(
          [
            plugins.extractText({
              filename: "[name].[contenthash].css",
              chunkFilename: "[name].[contenthash].css",
            }),
            // Write out stats object mapping named dynamic imports (aka page
            // components) to all their async chunks.
            plugins.extractStats(nonce),
            new StaticQueryMapper(store),
            isPartialHydrationEnabled
              ? new PartialHydrationPlugin(
                  path.join(
                    directory,
                    ".cache",
                    "partial-hydration",
                    "manifest.json",
                  ),
                  reporter,
                )
              : null,
          ].filter(Boolean),
        );

        break;
      }
      case "develop-html":
      case "build-html": {
        // Add global fetch in node environments
        // configPlugins.push(
        //   plugins.provide({
        //     fetch: require.resolve(`node-fetch`),
        //     "global.fetch": require.resolve(`node-fetch`),
        //   })
        // )
        break;
      }
    }

    return configPlugins;
  }

  function getDevtool(): false | "eval-cheap-module-source-map" | "source-map" {
    switch (suppliedStage) {
      case "develop":
        return "eval-cheap-module-source-map";
      // use a normal `source-map` for the html phases since
      // it gives better line and column numbers
      case "develop-html":
      case "build-html":
      case "build-javascript":
        return "source-map";
      default:
        return false;
    }
  }

  function getMode(): "development" | "production" {
    switch (suppliedStage) {
      case "develop":
      case "develop-html":
        return "development";
      case "build-javascript":
      case "build-html":
      default:
        return "production";
    }
  }

  function getModule(): { rules: Array<webpack.RuleSetRule> } {
    // Common config for every env.
    // prettier-ignore
    let configRules = [
      // Webpack expects extensions when importing ESM modules as that's what the spec describes.
      // Not all libraries have adapted so we don't enforce its behaviour
      // @see https://github.com/webpack/webpack/issues/11467
      {
        test: /\.mjs$/i,
        resolve: {
          byDependency: {
            esm: {
              fullySpecified: false,
            },
          },
        },
      },
      {
        test: /\.js$/i,
        descriptionData: {
          type: "module",
        },
        resolve: {
          byDependency: {
            esm: {
              fullySpecified: false,
            },
          },
        },
      },
      rules.js({
        modulesThatUseGatsby,
      }),
      rules.yaml(),
      rules.fonts(),
      rules.images(),
      rules.media(),
      rules.miscAssets(),
    ]

    // TODO(v5): Remove since this is only useful during Gatsby 4 publishes
    if (_CFLAGS_.GATSBY_MAJOR !== "5") {
      configRules.push({
        test: require.resolve("@gatsbyjs/reach-router/es/index"),
        type: "javascript/auto",
        use: [
          {
            loader: require.resolve(
              "./reach-router-add-basecontext-export-loader",
            ),
          },
        ],
      });
    }

    // Speedup 🏎️💨 the build! We only include transpilation of node_modules on javascript production builds
    // TODO create gatsby plugin to enable this behaviour on develop (only when people are requesting this feature)
    if (
      suppliedStage === "build-javascript" &&
      !hasES6ModuleSupport(directory)
    ) {
      configRules.push(
        rules.dependencies({
          modulesThatUseGatsby,
        }),
      );
    }

    switch (suppliedStage) {
      case "develop": {
        configRules = configRules.concat([
          {
            oneOf: [rules.cssModules(), rules.css()],
          },
        ]);

        break;
      }
      case "build-html":
      case "develop-html":
        // We don't deal with CSS at all when building the HTML.
        // The 'null' loader is used to prevent 'module not found' errors.
        // On the other hand CSS modules loaders are necessary.

        // prettier-ignore
        configRules = configRules.concat([
          {
            oneOf: [
              rules.cssModules(),
              {
                ...rules.css(),
                use: [loaders.null()],
              },
            ],
          },
        ])
        break;

      case "build-javascript":
        // We don't deal with CSS at all when building JavaScript but we still
        // need to process the CSS so offline-plugin knows about the various
        // assets referenced in your CSS.
        //
        // It's also necessary to process CSS Modules so your JS knows the
        // classNames to use.
        configRules = configRules.concat([
          {
            oneOf: [rules.cssModules(), rules.css()],
          },
        ]);

        break;
    }

    // TODO(v5): Remove since this is only useful during Gatsby 4 publishes
    // Removes it from the client payload as it's not used there
    if (_CFLAGS_.GATSBY_MAJOR !== "5") {
      configRules.push({
        test: /react-server-dom-webpack/,
        use: loaders.null(),
      });
    }

    return { rules: configRules };
  }

  function getPackageRoot({ pkg }: { pkg: string }): string {
    return path.dirname(require.resolve(`${pkg}/package.json`));
  }

  function getResolve(stage: Stage): {
    // Use the program's extension list (generated via the
    // 'resolvableExtensions' API hook).
    extensions: Array<string>;
    alias: {
      gatsby$: string;
      // Using directories for module resolution is mandatory because
      // relative path imports are used sometimes
      // See https://stackoverflow.com/a/49455609/6420957 for more details
      "@babel/runtime": string;
      "@reach/router": string;
      "react-lifecycles-compat": string;
      "react-server-dom-webpack": string;
      "@pmmmwh/react-refresh-webpack-plugin": string;
      "socket.io-client": string;
      "webpack-hot-middleware": string;
      $virtual: string;
    };
    plugins: Array<CoreJSResolver | CacheFolderResolver>;
  } {
    const { program } = store.getState();
    const resolve = {
      // Use the program's extension list (generated via the
      // 'resolvableExtensions' API hook).
      extensions: [...program.extensions],
      alias: {
        gatsby$: directoryPath(path.join(".cache", "gatsby-browser-entry.js")),
        // Using directories for module resolution is mandatory because
        // relative path imports are used sometimes
        // See https://stackoverflow.com/a/49455609/6420957 for more details
        "@babel/runtime": getPackageRoot({ pkg: "@babel/runtime" }),
        "@reach/router": getPackageRoot({ pkg: "@gatsbyjs/reach-router" }),
        "react-lifecycles-compat": directoryPath(
          ".cache/react-lifecycles-compat.js",
        ),
        "react-server-dom-webpack": getPackageRoot({
          pkg: "react-server-dom-webpack",
        }),
        "@pmmmwh/react-refresh-webpack-plugin": getPackageRoot({
          pkg: "@pmmmwh/react-refresh-webpack-plugin",
        }),
        "socket.io-client": getPackageRoot({ pkg: "socket.io-client" }),
        "webpack-hot-middleware": getPackageRoot({
          pkg: "@gatsbyjs/webpack-hot-middleware",
        }),
        $virtual: getAbsolutePathForVirtualModule("$virtual"),
      },
      plugins: [
        new CoreJSResolver(),
        new CacheFolderResolver(path.join(program.directory, ".cache")),
      ],
    };

    const target =
      stage === "build-html" || stage === "develop-html" ? "node" : "web";
    if (target === "web") {
      // TODO(v5): Remove since this is only useful during Gatsby 4 publishes
      if (_CFLAGS_.GATSBY_MAJOR !== "5") {
        resolve.alias["@reach/router"] = path.join(
          getPackageRoot({ pkg: "@gatsbyjs/reach-router" }),
          "es",
        );
      }

      resolve.alias["gatsby-core-utils/create-content-digest"] = directoryPath(
        ".cache/create-content-digest-browser-shim",
      );
    }

    // @ts-ignore
    if (stage === "build-javascript" && program.profile) {
      resolve.alias["react-dom$"] = "react-dom/profiling";
      resolve.alias["scheduler/tracing"] = "scheduler/tracing-profiling";
    }

    // SSR can have many react versions as some packages use their own version. React works best with 1 version.
    // By resolving react,react-dom from gatsby we'll get the site versions of react & react-dom because it's specified as a peerdependency.
    //
    // we need to put this below our resolve.alias for profiling as webpack picks the first one that matches
    // @see https://github.com/gatsbyjs/gatsby/issues/31098
    resolve.alias["react"] = getPackageRoot({ pkg: "react" });
    resolve.alias["react-dom"] = getPackageRoot({ pkg: "react-dom" });

    return resolve;
  }

  function getResolveLoader(): { modules: Array<string> } {
    const root = [path.resolve(directory, "node_modules")];

    const userLoaderDirectoryPath = path.resolve(directory, "loaders");

    try {
      if (fs.statSync(userLoaderDirectoryPath).isDirectory()) {
        root.push(userLoaderDirectoryPath);
      }
    } catch (err) {
      debug("Error resolving user loaders directory", err);
    }

    return {
      modules: [...root, path.join(__dirname, "../loaders"), "node_modules"],
    };
  }

  const config = {
    name: suppliedStage,
    // Context is the base directory for resolving the entry option.
    context: directory,
    entry: getEntry(),
    output: getOutput(),

    module: getModule(),
    plugins: getPlugins(nonce),

    devtool: getDevtool(),
    // Turn off performance hints as we (for now) don't want to show the normal
    // webpack output anywhere.
    performance: {
      hints: false,
    },
    mode: getMode(),

    resolveLoader: getResolveLoader(),
    resolve: getResolve(suppliedStage),
  };

  if (suppliedStage === "build-html" || suppliedStage === "develop-html") {
    // @ts-ignore
    config.target = "node14.15";
  } else {
    // @ts-ignore
    config.target = ["web", "es5"];
  }

  function isCssModule(module): boolean {
    return module.type === "css/mini-extract";
  }

  if (suppliedStage === "develop") {
    // @ts-ignore
    config.optimization = {
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          default: false,
          defaultVendors: false,
          framework: {
            chunks: "all",
            name: "framework",
            test: FRAMEWORK_BUNDLES_REGEX,
            priority: 40,
            // Don't let webpack eliminate this chunk (prevents this chunk from becoming a part of the commons chunk)
            enforce: true,
          },
          // Bundle all css & lazy css into one stylesheet to make sure lazy components do not break
          // TODO make an exception for css-modules
          styles: {
            test(module): boolean {
              return isCssModule(module);
            },

            name: "commons",
            priority: 40,
            enforce: true,
          },
        },
      },
      minimize: false,
    };
  }

  if (suppliedStage === "build-html" || suppliedStage === "develop-html") {
    // @ts-ignore
    config.optimization = {
      // TODO fix our partial hydration manifest
      mangleExports: !isPartialHydrationEnabled,
      minimize: false,
    };

    if (suppliedStage === "build-html") {
      // @ts-ignore
      config.optimization.splitChunks = {
        chunks: "async",
        minSize: 20000,
        minRemainingSize: 0,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        enforceSizeThreshold: 50000,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      };
    } else {
      // @ts-ignore
      config.optimization.splitChunks = {
        cacheGroups: {
          default: false,
          defaultVendors: false,
        },
      };
    }
  }

  if (suppliedStage === "build-javascript") {
    const componentsCount = store.getState().components.size;

    const splitChunks = {
      chunks: "all",
      cacheGroups: {
        default: false,
        defaultVendors: false,
        framework: {
          chunks: "all",
          name: "framework",
          // Important: If you change something here, also update "gatsby-plugin-preact"
          test: (module): boolean => {
            // Packages like gatsby-plugin-image might import from "react-dom/server". We don't want to include react-dom-server in the framework bundle.
            // A rawRequest might look like these:
            // - "react-dom/server"
            // - "node_modules/react-dom/cjs/react-dom-server-legacy.browser.production.min.js"
            // Use a "/" before "react-dom-server" so that we don't match packages that contain "react-dom-server" in their name
            if (
              module?.rawRequest === "react-dom/server" ||
              module?.rawRequest?.includes("/react-dom-server")
            ) {
              return false;
            }

            return FRAMEWORK_BUNDLES_REGEX.test(module.nameForCondition());
          },
          priority: 40,
          // Don't let webpack eliminate this chunk (prevents this chunk from becoming a part of the commons chunk)
          enforce: true,
        },
        // if a module is bigger than 160kb from node_modules we make a separate chunk for it
        lib: {
          test(module): boolean {
            return (
              !isCssModule(module) &&
              module.size() > 160_000 &&
              /node_modules[/\\]/.test(module.identifier())
            );
          },
          name(module): string {
            const hash = crypto.createHash("sha1");

            if (!module.libIdent) {
              throw new Error(
                `Encountered unknown module type: ${module.type}. Please open an issue.`,
              );
            }

            hash.update(module.libIdent({ context: program.directory }));

            return hash.digest("hex").substring(0, 8);
          },
          priority: 30,
          minChunks: 1,
          reuseExistingChunk: true,
        },
        commons: {
          name: "commons",
          // if a chunk is used on all components we put it in commons (we need at least 2 components)
          minChunks: Math.max(componentsCount, 2),
          priority: 20,
        },
        // If a chunk is used in at least 2 components we create a separate chunk
        shared: {
          test(module, { chunkGraph }): boolean {
            for (const chunk of chunkGraph.getModuleChunksIterable(module)) {
              if (chunk.canBeInitial()) {
                return false;
              }
            }

            return !isCssModule(module);
          },
          name(_module, chunks): string {
            const hash = crypto
              .createHash("sha1")
              .update(chunks.reduce((acc, chunk) => acc + chunk.name, ""))
              .digest("hex");

            return hash;
          },
          priority: 10,
          minChunks: 2,
          reuseExistingChunk: true,
        },

        // Bundle all css & lazy css into one stylesheet to make sure lazy components do not break
        // TODO make an exception for css-modules
        styles: {
          test(module): boolean {
            return isCssModule(module);
          },

          name: "styles",
          priority: 40,
          enforce: true,
        },
      },
      // We load our pages async through async-requires, maxInitialRequests doesn't have an effect on chunks derived from page components.
      // By default webpack has set maxAsyncRequests to 6, in some cases this isn't enough an actually makes the bundle size blow up.
      // We've set maxAsyncRequests to Infinity to negate this. This could potentionally exceed the 25 initial requests that we set before
      // sadly I do not have a better solution.
      maxAsyncRequests: Infinity,
      maxInitialRequests: 25,
      minSize: 20_000,
    };

    // @ts-ignore
    config.optimization = {
      runtimeChunk: {
        name: "webpack-runtime",
      },
      // TODO fix our partial hydration manifest
      mangleExports: !isPartialHydrationEnabled,
      splitChunks,
      minimizer: [
        // TODO: maybe this option should be noMinimize?
        // @ts-ignore
        !program.noUglify &&
          plugins.minifyJs(
            // @ts-ignore
            program.profile
              ? {
                  terserOptions: {
                    keep_classnames: true,
                    keep_fnames: true,
                  },
                }
              : {},
          ),
        plugins.minifyCss(),
      ].filter(Boolean),
    };
  }

  if (suppliedStage === "build-html" || suppliedStage === "develop-html") {
    // externalize react, react-dom when develop-html or build-html(when not generating engines)
    const shouldMarkPackagesAsExternal =
      suppliedStage === "develop-html" || !shouldGenerateEngines();

    // tracking = build-html (when not generating engines)
    const shouldTrackBuiltins =
      suppliedStage === "build-html" && !shouldGenerateEngines();

    // removes node internals from bundle
    // https://webpack.js.org/configuration/externals/#externalspresets
    // @ts-ignore
    config.externalsPresets = {
      // use it only when not tracking builtins (tracking builtins provide their own fallbacks)
      node: !shouldTrackBuiltins,
    };

    // @ts-ignore
    config.externals = [];

    if (shouldMarkPackagesAsExternal) {
      // Packages we want to externalize to save some build time
      // https://github.com/gatsbyjs/gatsby/pull/14208#pullrequestreview-240178728
      // const externalList = [`common-tags`, `lodash`, `semver`, /^lodash\//]

      // Packages we want to externalize because meant to be user-provided
      const userExternalList = ["react", /^react-dom\//];

      function checkItem(
        item: string | RegExp | null | undefined,
        request: string,
      ): boolean {
        if (typeof item === "string" && item === request) {
          return true;
        } else if (item instanceof RegExp && item.test(request)) {
          return true;
        }

        return false;
      }

      // @ts-ignore
      config.externals.push(function (
        { context, getResolve, request },
        callback,
      ) {
        // allows us to resolve webpack aliases from our config
        // helpful for when react is aliased to preact-compat
        // Force commonjs as we're in node land
        const resolver = getResolve({
          dependencyType: "commonjs",
        });

        // User modules that do not need to be part of the bundle
        if (userExternalList.some((item) => checkItem(item, request))) {
          // TODO figure out to make preact work with this too

          resolver(context, request, (err, newRequest) => {
            if (err) {
              callback(err);
              return;
            }

            callback(null, newRequest);
          });
          return;
        }
        // TODO look into re-enabling, breaks builds right now because of esm
        // User modules that do not need to be part of the bundle
        // if (externalList.some(item => checkItem(item, request))) {
        //   resolver(context, request, (err, request) => {
        //     if (err) {
        //       callback(err)
        //       return
        //     }

        //     callback(null, `commonjs2 ${request}`)
        //   })
        //   return
        // }

        callback();
      });
    }

    if (shouldTrackBuiltins) {
      if (suppliedStage === "build-html") {
        const builtinModulesToTrack = [
          "fs",
          "http",
          "http2",
          "https",
          "child_process",
        ];
        const builtinsExternalsDictionary = Module.builtinModules.reduce(
          (acc, builtinModule) => {
            if (builtinModulesToTrack.includes(builtinModule)) {
              const builtinModuleTracked = path.join(
                program.directory,
                ".cache",
                "ssr-builtin-trackers",
                builtinModule,
              );
              acc[builtinModule] = `commonjs ${builtinModuleTracked}`;
              acc[`node:${builtinModule}`] = `commonjs ${builtinModuleTracked}`;
            } else {
              acc[builtinModule] = `commonjs ${builtinModule}`;
              acc[`node:${builtinModule}`] = `commonjs ${builtinModule}`;
            }
            return acc;
          },
          {},
        );

        // @ts-ignore
        config.externals.unshift(builtinsExternalsDictionary);
      }
    }
  }

  if (suppliedStage === "develop") {
    // @ts-ignore
    config.externals = {
      "socket.io-client": "io",
    };
  }

  if (
    suppliedStage === "build-javascript" ||
    suppliedStage === "build-html" ||
    suppliedStage === "develop" ||
    suppliedStage === "develop-html"
  ) {
    const cacheLocation = path.join(
      program.directory,
      ".cache",
      "webpack",
      "stage-" + suppliedStage,
    );
    const pluginsPathsPromises = store
      .getState()
      .flattenedPlugins.filter((plugin) =>
        plugin.nodeAPIs.includes("onCreateWebpackConfig"),
      )
      .map(async (plugin) => {
        return (
          // @ts-ignore
          plugin.resolvedCompiledGatsbyNode ??
          (await resolveJSFilepath({
            rootDir: plugin.resolve,
            filePath: path.join(plugin.resolve, "gatsby-node"),
          }))
        );
      });
    const pluginsPaths = await Promise.all(pluginsPathsPromises);

    const cacheConfig = {
      type: "filesystem",
      name: suppliedStage,
      cacheLocation,
      buildDependencies: {
        config: [__filename, ...pluginsPaths],
      },
    };

    // @ts-ignore
    config.cache = cacheConfig;
  }

  store.dispatch(actions.replaceWebpackConfig(config));
  function getConfig(): webpack.Configuration {
    return store.getState().webpack;
  }

  await apiRunnerNode("onCreateWebpackConfig", {
    getConfig,
    // we will converge to build-html later on but for now this was the fastest way to get SSR to work
    stage: suppliedStage,
    rules,
    loaders,
    plugins,
    parentSpan,
  });

  if (fastRefreshPlugin) {
    // Fast refresh plugin has `include` option that determines
    // wether HMR code gets injected. We need to make sure all custom loaders
    // (like .ts or .mdx) that use our babel-loader will be taken into account
    // when deciding which modules get fast-refresh HMR addition.
    const fastRefreshIncludes = [];
    const babelLoaderLoc = require.resolve("./babel-loader");
    const rules = getConfig().module?.rules ?? [];

    for (const rule of rules) {
      // @ts-ignore
      if (!rule?.use && !rule?.loader) {
        continue;
      }

      // @ts-ignore
      let use = rule.use;

      if (typeof use === "function") {
        // @ts-ignore
        use = rule.use({});
      }

      const ruleLoaders = Array.isArray(use)
        ? use.map((useEntry) => {
            // @ts-ignore
            return typeof useEntry === "string" ? useEntry : useEntry.loader;
          })
        : // @ts-ignore
          [use?.loader ?? rule.loader];

      const hasBabelLoader = ruleLoaders.some(
        (loader) => loader === babelLoaderLoc,
      );

      if (hasBabelLoader) {
        // @ts-ignore
        fastRefreshIncludes.push(rule.test);
      }
    }

    // start with default include of fast refresh plugin
    const includeRegex = /\.([jt]sx?|flow)$/i;
    includeRegex.test = (modulePath: string): boolean => {
      // drop query param from request (i.e. ?type=component for mdx-loader)
      // so loader rule test work well
      const queryParamStartIndex = modulePath.indexOf("?");
      if (queryParamStartIndex !== -1) {
        modulePath = modulePath.slice(0, queryParamStartIndex);
      }

      return fastRefreshIncludes.some((re) => {
        // @ts-ignore
        return re.test(modulePath);
      });
    };

    fastRefreshPlugin.options.include = includeRegex;
  }

  return getConfig();
}
