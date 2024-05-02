// eslint-disable-next-line @typescript-eslint/naming-convention
import _ from "lodash";
import moment from "moment";
import chokidar from "chokidar";
import systemPath from "node:path";

import { emitter, store } from "../../redux";
import { actions } from "../../redux/actions";
import { getNode } from "../../datastore";
import { findCompiledLocalPluginModule } from "../../utils/parcel/compile-gatsby-files";
import type {
  CreateResolversArgs,
  GatsbyNode,
  SourceNodesArgs,
} from "../../..";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformPackageJson(json: any): any {
  function transformDeps(deps): Array<{
    name: string;
    version: unknown;
  }> {
    return _.entries(deps).map(([name, version]) => {
      return {
        name,
        version,
      };
    });
  }

  json = _.pick(json, [
    "name",
    "description",
    "version",
    "main",
    "keywords",
    "author",
    "license",
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependecies",
    "bundledDependecies",
  ]);
  json.dependencies = transformDeps(json.dependencies);
  json.devDependencies = transformDeps(json.devDependencies);
  json.peerDependencies = transformDeps(json.peerDependencies);
  json.optionalDependecies = transformDeps(json.optionalDependecies);
  json.bundledDependecies = transformDeps(json.bundledDependecies);

  return json;
}

function createPageId(path: string): string {
  return `SitePage ${path}`;
}

export const sourceNodes: GatsbyNode["sourceNodes"] = function sourceNodes({
  createContentDigest,
  getNodesByType,
  actions,
  store,
}: SourceNodesArgs): void {
  const { createNode, deleteNode } = actions;
  const { program, flattenedPlugins, config } = store.getState();

  flattenedPlugins.forEach((plugin) => {
    plugin.pluginFilepath = plugin.resolve;

    createNode({
      ...plugin,
      packageJson: transformPackageJson(
        require(`${plugin.resolve}/package.json`),
      ),
      parent: null,
      children: [],
      internal: {
        contentDigest: createContentDigest(plugin),
        type: "SitePlugin",
      },
    });
  });

  // Add site node.

  function createGatsbyConfigNode(config = {}): void {
    // Delete plugins from the config as we add plugins above.
    const configCopy = { ...config };

    // @ts-ignore
    delete configCopy.plugins;

    const node = {
      siteMetadata: {
        // @ts-ignore
        ...configCopy.siteMetadata,
      },
      port: program.port,
      host: program.host,
      ...configCopy,
    };
    createNode({
      ...node,
      id: "Site",
      parent: null,
      children: [],
      internal: {
        contentDigest: createContentDigest(node),
        type: "Site",
      },
    });
  }

  createGatsbyConfigNode(config);

  const buildTime = moment()
    .subtract(process.uptime(), "seconds")
    .startOf("second")
    .toJSON();

  const metadataNode = { buildTime };

  createNode({
    ...metadataNode,
    id: "SiteBuildMetadata",
    parent: null,
    children: [],
    internal: {
      contentDigest: createContentDigest(metadataNode),
      type: "SiteBuildMetadata",
    },
  });

  const pathToGatsbyConfig =
    findCompiledLocalPluginModule(
      program.directory,
      "default-site-plugin",
      "gatsby-config",
    ) ?? systemPath.join(program.directory, "gatsby-config.js");
  watchConfig(pathToGatsbyConfig, createGatsbyConfigNode);

  // Create nodes for functions
  const { functions } = store.getState();

  function createFunctionNode(config): void {
    createNode({
      id: `gatsby-function-${config.absoluteCompiledFilePath}`,
      ...config,
      parent: null,
      children: [],
      internal: {
        contentDigest: createContentDigest(config),
        type: "SiteFunction",
      },
    });
  }

  functions.forEach((config) => {
    createFunctionNode(config);
  });

  // Listen for updates to functions to update the nodes.
  emitter.on("SET_SITE_FUNCTIONS", (action) => {
    // Identify any now deleted functions and remove their nodes.
    const existingNodes = getNodesByType("SiteFunction");
    const newFunctionsSet = new Set();
    action.payload.forEach((config) =>
      newFunctionsSet.add(`gatsby-function-${config.absoluteCompiledFilePath}`),
    );
    const toBeDeleted = existingNodes.filter(
      (node) => !newFunctionsSet.has(node.id),
    );
    toBeDeleted.forEach((node) => deleteNode(node));

    action.payload.forEach((config) => {
      createFunctionNode(config);
    });
  });
};

function watchConfig(pathToGatsbyConfig, createGatsbyConfigNode): void {
  chokidar.watch(pathToGatsbyConfig).on("change", async () => {
    const oldCache = require.cache[require.resolve(pathToGatsbyConfig)];
    try {
      // Delete require cache so we can reload the module.
      delete require.cache[require.resolve(pathToGatsbyConfig)];
      const config = await import(pathToGatsbyConfig).then(
        (mod) => mod.default,
      );
      createGatsbyConfigNode(config);
    } catch (e) {
      // Restore the old cache since requiring the new gatsby-config.js failed.
      if (oldCache !== undefined) {
        require.cache[require.resolve(pathToGatsbyConfig)] = oldCache;
      }
    }
  });
}

export const createResolvers: GatsbyNode["createResolvers"] =
  function createResolvers({ createResolvers }: CreateResolversArgs): void {
    const resolvers = {
      Site: {
        buildTime: {
          type: "Date",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          resolve(source, args, context, info): any {
            const { buildTime } = context.nodeModel.getNodeById({
              id: "SiteBuildMetadata",
              type: "SiteBuildMetadata",
            });
            return info.originalResolver(
              {
                ...source,
                buildTime,
              },
              args,
              context,
              info,
            );
          },
        },
      },
    };

    createResolvers(resolvers);
  };

// Listen for DELETE_PAGE and delete page nodes.
emitter.on("DELETE_PAGE", (action) => {
  const nodeId = createPageId(action.payload.path);
  const node = getNode(nodeId);
  const ax = actions.deleteNode(node);

  if (Array.isArray(ax)) {
    action.forEach((a) => {
      store.dispatch(a);
    });
  } else {
    store.dispatch(ax);
  }
});
