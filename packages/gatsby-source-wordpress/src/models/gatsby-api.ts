import merge from "lodash/merge"
import { createLocalFileNode } from "~/steps/source-nodes/create-nodes/create-local-file-node"
import { menuBeforeChangeNode } from "~/steps/source-nodes/before-change-node/menu"
import { cloneDeep } from "lodash"
import { inPreviewMode } from "~/steps/preview"
import { usingGatsbyV4OrGreater } from "~/utils/gatsby-version"

import { createModel } from "@rematch/core"
import { RootModel } from "./index"

export const previewOptimizationPreset = {
  presetName: `PREVIEW_OPTIMIZATION`,
  useIf: inPreviewMode,
  options: {
    html: {
      useGatsbyImage: false,
      createStaticFiles: false,
    },

    type:
      // in Gatsby v4+ we can't fetch nodes in resolvers.
      // This means if we apply the following settings in v4+
      // the site will have a lot of missing data when connection
      // fields reference node's which werent fetched due to the limit option.
      // so only apply the following settings before Gatsby v4
      !usingGatsbyV4OrGreater
        ? {
            __all: {
              limit: 50,
            },
            Comment: {
              limit: 0,
            },
            Menu: {
              limit: null,
            },
            MenuItem: {
              limit: null,
            },
            User: {
              limit: null,
            },
          }
        : {},
  },
}

const defaultPluginOptions = {
  url: null,
  verbose: true,
  debug: {
    throwRefetchErrors: false,
    graphql: {
      showQueryOnError: false,
      showQueryVarsOnError: false,
      copyQueryOnError: false,
      panicOnError: false,
      onlyReportCriticalErrors: true,
      copyNodeSourcingQueryAndExit: false,
      writeQueriesToDisk: false,
      copyHtmlResponseOnError: false,
      printIntrospectionDiff: false,
    },
    timeBuildSteps: false,
    disableCompatibilityCheck: false,
    preview: false,
  },
  develop: {
    nodeUpdateInterval: 5000,
    hardCacheMediaFiles: false,
    hardCacheData: false,
  },
  production: {
    hardCacheMediaFiles: false,
    allow404Images: false,
    allow401Images: false,
  },
  auth: {
    htaccess: {
      username: null,
      password: null,
    },
  },
  schema: {
    queryDepth: 15,
    circularQueryLimit: 5,
    typePrefix: `Wp`,
    timeout: 30 * 1000, // 30 seconds
    perPage: 100,
    requestConcurrency: 15,
    previewRequestConcurrency: 5,
  },
  excludeFieldNames: [],
  html: {
    // this causes the source plugin to find/replace images in html
    useGatsbyImage: true,
    // this adds a limit to the max width an image can be
    // if the image selected in WP is smaller, or the image is smaller than this
    // those values will be used instead.
    imageMaxWidth: null,
    // if a max width can't be inferred from html, this value will be passed to Sharp
    // if the image is smaller than this, the images width will be used instead
    fallbackImageMaxWidth: 1024,
    imageQuality: 90,
    //
    // Transforms anchor links, video src's, and audio src's (that point to wp-content files) into local file static links
    // Also fetches those files if they don't already exist
    createStaticFiles: true,
    //
    // this adds image options to images in HTML fields when html.useGatsbyImage is also set
    gatsbyImageOptions: {},
  },
  presets: [previewOptimizationPreset],
  activePluginOptionsPresets: [],
  type: {
    __all: {
      // @todo make dateFields into a plugin option?? It's not currently
      // this may not be needed since WPGraphQL will be getting a Date type soon
      // dateFields: [`date`],
    },
    RootQuery: {
      excludeFieldNames: [`viewer`, `node`, `schemaMd5`],
    },
    UserToMediaItemConnection: {
      // if this type is not excluded it will potentially fetch an extra 100
      // media items per user during node sourcing
      exclude: true,
    },
    WpContentNodeToEditLockConnectionEdge: {
      exclude: true,
    },
    WPPageInfo: {
      exclude: true,
    },
    ActionMonitorAction: {
      exclude: true,
    },
    UserToActionMonitorActionConnection: {
      exclude: true,
    },
    Plugin: {
      exclude: true,
    },
    Theme: {
      exclude: true,
    },
    MediaItem: {
      lazyNodes: false,
      createFileNodes: true,
      localFile: {
        excludeByMimeTypes: [],
        maxFileSizeBytes: 15728640, // 15Mb
        requestConcurrency: 100,
      },
      beforeChangeNode: async ({
        remoteNode,
        actionType,
        typeSettings,
        // @todo type this
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }): Promise<any> => {
        if (
          // we fetch lazy nodes files in resolvers, no need to fetch them here.
          typeSettings.lazyNodes ||
          // or if the user doesn't want us to create file nodes, don't do anything.
          !typeSettings.createFileNodes
        ) {
          return {
            remoteNode,
          }
        }

        if (
          actionType === `CREATE_ALL` ||
          actionType === `CREATE` ||
          actionType === `UPDATE`
        ) {
          const createdMediaItem = await createLocalFileNode({
            mediaItemNode: remoteNode,
            parentName: `Node action ${actionType}`,
          })

          if (createdMediaItem) {
            remoteNode.localFile = {
              id: createdMediaItem.id,
            }

            return {
              remoteNode,
            }
          }
        }

        return {
          remoteNode,
        }
      },
    },
    ContentNode: {
      nodeInterface: true,
    },
    TermNode: {
      nodeInterface: true,
    },
    Menu: {
      /**
       * This is used to fetch child menu items
       * on Menus as it's problematic to fetch them otherwise
       * in WPGQL currently
       *
       * So after a Menu Node is fetched and processed, this function runs
       * It loops through the child menu items, generates a query for them,
       * fetches them, and creates nodes out of them.
       *
       * This runs when initially fetching all nodes, and after an incremental
       * fetch happens
       *
       * When we can get a list of all menu items regardless of location in WPGQL, this can be removed.
       */
      beforeChangeNode: menuBeforeChangeNode,
    },
    // the next two types can't be sourced in Gatsby properly yet
    // @todo instead of excluding these manually, auto exclude them
    // based on how they behave (no single node query available)
    EnqueuedScript: {
      exclude: true,
    },
    EnqueuedStylesheet: {
      exclude: true,
    },
    EnqueuedAsset: {
      exclude: true,
    },
    ContentNodeToEnqueuedScriptConnection: {
      exclude: true,
    },
    ContentNodeToEnqueuedStylesheetConnection: {
      exclude: true,
    },
    TermNodeToEnqueuedScriptConnection: {
      exclude: true,
    },
    TermNodeToEnqueuedStylesheetConnection: {
      exclude: true,
    },
    UserToEnqueuedScriptConnection: {
      exclude: true,
    },
    UserToEnqueuedStylesheetConnection: {
      exclude: true,
    },
  },
}

const gatsbyApi = createModel<RootModel>()({
  state: {
    helpers: {},
    pluginOptions: defaultPluginOptions,
  },

  reducers: {
    setState(state, payload) {
      const stateCopy = cloneDeep(state)

      const defaultPresets = stateCopy.pluginOptions?.presets || []
      const userPresets = payload.pluginOptions?.presets || []

      /**
       * Presets are plugin option configurations that are conditionally
       * applied based on a `useIf` function (which returns a boolean)
       * If it returns true, that preset is used.
       */
      const optionsPresets = [...defaultPresets, ...userPresets]?.filter(
        preset => preset.useIf(payload.helpers, payload.pluginOptions)
      )

      if (optionsPresets?.length) {
        state.activePluginOptionsPresets = optionsPresets

        let presetModifiedOptions = state.pluginOptions

        for (const preset of optionsPresets) {
          presetModifiedOptions = merge(presetModifiedOptions, preset.options)
        }

        state.pluginOptions = presetModifiedOptions
      }

      // add the user defined plugin options last so they override any presets
      state = merge(state, payload)

      return state
    },
  },
})

export default gatsbyApi
