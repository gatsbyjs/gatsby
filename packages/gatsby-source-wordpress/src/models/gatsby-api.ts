import { GatsbyNodeApiHelpers } from "~/utils/gatsby-types"
import merge from "lodash/merge"
import { createLocalFileNode } from "~/steps/source-nodes/create-nodes/create-local-file-node"
import { menuBeforeChangeNode } from "~/steps/source-nodes/before-change-node/menu"
import { cloneDeep } from "lodash"
import { inPreviewMode } from "~/steps/preview"
import { usingGatsbyV4OrGreater } from "~/utils/gatsby-version"
import { createModel } from "@rematch/core"
import { IRootModel } from "."

export interface IPluginOptionsPreset {
  presetName: string
  useIf: (
    helpers: GatsbyNodeApiHelpers,
    pluginOptions: IPluginOptions
  ) => boolean
  options: IPluginOptions
}

export const previewOptimizationPreset: IPluginOptionsPreset = {
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
export interface IPluginOptions {
  url?: string
  verbose?: boolean
  debug?: {
    throwRefetchErrors?: boolean
    graphql?: {
      showQueryOnError?: boolean
      showQueryVarsOnError?: boolean
      copyQueryOnError?: boolean
      panicOnError?: boolean
      onlyReportCriticalErrors?: boolean
      copyNodeSourcingQueryAndExit?: boolean
      writeQueriesToDisk?: boolean
      copyHtmlResponseOnError?: boolean
      printIntrospectionDiff?: boolean
    }
    timeBuildSteps?: Array<string> | boolean
    disableCompatibilityCheck?: boolean
    preview?: boolean
  }
  develop?: {
    nodeUpdateInterval?: number
    hardCacheMediaFiles?: boolean
    hardCacheData?: boolean
  }
  production?: {
    hardCacheMediaFiles?: boolean
    allow404Images?: boolean
    allow401Images?: boolean
  }
  auth?: {
    htaccess: {
      username: string | null
      password: string | null
    }
  }
  schema?: {
    queryDepth: number
    circularQueryLimit: number
    typePrefix: string
    timeout: number // 30 seconds
    perPage: number
    requestConcurrency?: number
    previewRequestConcurrency?: number
  }
  excludeFieldNames?: []
  html?: {
    useGatsbyImage?: boolean
    gatsbyImageOptions?: Record<string, unknown>
    imageMaxWidth?: number
    fallbackImageMaxWidth?: number
    imageQuality?: number
    createStaticFiles?: boolean
    placeholderType?: `blurred` | `dominantColor`
  }
  presets?: Array<IPluginOptionsPreset>
  type?: {
    [typename: string]: {
      limit?: number
      excludeFieldNames?: Array<string>

      exclude?: boolean
      // @todo type this
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      beforeChangeNode?: (any) => Promise<any>
      nodeInterface?: boolean
      lazyNodes?: boolean
      createFileNodes?: boolean
      localFile?: {
        excludeByMimeTypes?: Array<string>
        maxFileSizeBytes?: number
        requestConcurrency?: number
      }

      placeholderSizeName?: string
    }
  }
}

const defaultPluginOptions: IPluginOptions = {
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

    placeholderType: `blurred`,
  },
  presets: [previewOptimizationPreset],
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
      exclude: false,
      placeholderSizeName: `gatsby-image-placeholder`,
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
  },
}

export interface IGatsbyApiState {
  helpers: GatsbyNodeApiHelpers
  pluginOptions: IPluginOptions
  activePluginOptionsPresets?: Array<IPluginOptionsPreset>
}

const gatsbyApi = createModel<IRootModel>()({
  state: {
    helpers: {},
    pluginOptions: defaultPluginOptions,
  } as IGatsbyApiState,

  reducers: {
    setState(
      state: IGatsbyApiState,
      payload: IGatsbyApiState
    ): IGatsbyApiState {
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
  effects: () => {
    return {}
  },
})

export default gatsbyApi
