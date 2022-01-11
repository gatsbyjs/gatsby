import { getPluginOptions } from "./../../utils/get-gatsby-api"
import { GatsbyHelpers } from "~/utils/gatsby-types"
import path from "path"
import fs from "fs-extra"
import chalk from "chalk"
import urlUtil from "url"
import PQueue from "p-queue"
import { dump } from "dumper.js"
import { actions as gatsbyActions } from "gatsby/dist/redux/actions/public"

import { remoteSchemaSupportsFieldNameOnTypeName } from "~/steps/ingest-remote-schema/introspect-remote-schema"
import { paginatedWpNodeFetch } from "~/steps/source-nodes/fetch-nodes/fetch-nodes-paginated"
import fetchGraphql from "~/utils/fetch-graphql"

import store from "~/store"

import { fetchAndCreateSingleNode } from "~/steps/source-nodes/update-nodes/wp-actions/update"
import { formatLogMessage } from "~/utils/format-log-message"
import { touchValidNodes } from "../source-nodes/update-nodes/fetch-node-updates"

import { Reporter } from "gatsby/reporter"
import { invokeAndCleanupLeftoverPreviewCallbacks } from "./cleanup"

const inDevelopPreview =
  process.env.NODE_ENV === `development` &&
  !!process.env.ENABLE_GATSBY_REFRESH_ENDPOINT

const inPreviewRunner =
  process.env.RUNNER_TYPE === `PREVIEW` ||
  process.env.RUNNER_TYPE === `INCREMENTAL_PREVIEWS` ||
  !!process.env.IS_GATSBY_PREVIEW

// this is a function simply because many places in the code expect it to be.
// it used to call store.getState() and check for some state to determine preview mode
export const inPreviewMode = (): boolean => inDevelopPreview || inPreviewRunner

export type PreviewStatusUnion =
  | `PREVIEW_SUCCESS`
  | `NO_PAGE_CREATED_FOR_PREVIEWED_NODE`
  | `GATSBY_PREVIEW_PROCESS_ERROR`
  | `RECEIVED_PREVIEW_DATA_FROM_WRONG_URL`

export interface IPreviewData {
  previewDatabaseId: number
  userDatabaseId: number
  token: string
  remoteUrl: string
  modified: string
  parentDatabaseId: number
  id: string
  isDraft: boolean
  singleName: string
  since?: number
  refreshing?: boolean
  preview?: boolean
  manifestIds?: Array<string>
}

interface IPageNode {
  path: string
}

let previewQueue: PQueue

const getPreviewQueue = (): PQueue => {
  if (!previewQueue) {
    const { previewRequestConcurrency } =
      store.getState().gatsbyApi.pluginOptions.schema

    previewQueue = new PQueue({
      concurrency: previewRequestConcurrency,
      carryoverConcurrencyCount: true,
    })
  }

  return previewQueue
}

// This checks wether or not we're already currently processing a preview
// for the passed preview id.
const previewForIdIsAlreadyBeingProcessed = (id: string): boolean => {
  if (!id) {
    return false
  }

  const existingCallbacks =
    store.getState().previewStore.nodePageCreatedCallbacks

  const alreadyProcessingThisPreview = !!existingCallbacks?.[id]

  return alreadyProcessingThisPreview
}

/**
 * For previews of draft posts, gatsby develop will throw a bunch of 404 errors
 * while WPGatsby is trying to read page-data.json
 * So we can write a dummy page-data.json if one doesn't exist.
 * that way there will be no 404's and Gatsby will overwrite our dummy file when it
 * needs to.
 */
const writeDummyPageDataJsonIfNeeded = async ({
  previewData,
  pageNode,
}: {
  previewData: IPreviewData
  pageNode: IPageNode
}): Promise<void> => {
  if (!previewData.isDraft) {
    return
  }

  const pageDataDirectory = path.join(
    process.cwd(),
    `public/page-data`,
    pageNode.path
  )

  await fs.ensureDir(pageDataDirectory)

  const pageDataPath = path.join(pageDataDirectory, `page-data.json`)

  const pageDataExists = await fs.pathExists(pageDataPath)

  if (!pageDataExists) {
    await fs.writeJSON(pageDataPath, {
      isDraft: previewData.isDraft,
    })
  }
}

interface IOnPreviewStatusInput {
  status: PreviewStatusUnion
  context?: string
  nodeId?: string
  passedNode?: {
    modified?: string
    databaseId: number
  }
  pageNode?: IPageNode
  graphqlEndpoint?: string
  error?: Error
}

const createPreviewStatusCallback =
  ({
    previewData,
    reporter,
  }: {
    previewData: IPreviewData
    reporter: Reporter
  }) =>
  async ({
    passedNode,
    pageNode,
    context,
    status,
    graphqlEndpoint,
    error,
  }: IOnPreviewStatusInput): Promise<void> => {
    if (status === `PREVIEW_SUCCESS`) {
      // we might need to write a dummy page-data.json so that
      // Gatsby doesn't throw 404 errors when WPGatsby tries to read this file
      // that maybe doesn't exist yet
      await writeDummyPageDataJsonIfNeeded({ previewData, pageNode })
    }

    const statusContext = error?.message
      ? `${context}\n\n${error.message}`
      : context

    const { data } = await fetchGraphql({
      url: graphqlEndpoint,
      query: /* GraphQL */ `
        mutation MUTATE_PREVIEW_NODE(
          $input: WpGatsbyRemotePreviewStatusInput!
        ) {
          wpGatsbyRemotePreviewStatus(input: $input) {
            success
          }
        }
      `,
      variables: {
        input: {
          clientMutationId: `sendPreviewStatus`,
          modified: passedNode?.modified,
          pagePath: pageNode?.path,
          parentDatabaseId:
            previewData.parentDatabaseId || previewData.previewDatabaseId, // if the parentDatabaseId is 0 we want to use the previewDatabaseId
          status,
          statusContext,
        },
      },
      errorContext: `Error occurred while mutating WordPress Preview node meta.`,
      forceReportCriticalErrors: true,
      headers: {
        WPGatsbyPreview: previewData.token,
        WPGatsbyPreviewUser: previewData.userDatabaseId,
      },
    })

    if (data?.wpGatsbyRemotePreviewStatus?.success) {
      reporter.log(
        formatLogMessage(
          `Successfully sent Preview status back to WordPress post ${previewData.id} during ${context}`
        )
      )
    } else {
      reporter.log(
        formatLogMessage(
          `failed to mutate WordPress post ${previewData.id} during Preview ${context}.\nCheck your WP server logs for more information.`
        )
      )
    }
  }

/**
 * This is called and passed the result from the ActionMonitor.previewData object along with a JWT token
 * It sources a single preview and creates the callback that's invoked to send preview status back to WPGatsby.
 * When the preview status is sent back to Gatsby, the preview action that this
 * logic is processing is deleted in the WP instance. That's why we call
 * previewForIdIsAlreadyBeingProcessed to see if another preview webhook
 * already started processing for this action
 */
export const sourcePreview = async ({
  previewData,
  reporter,
  actions,
}: {
  previewData: IPreviewData
  reporter: Reporter
  actions: typeof gatsbyActions
}): Promise<void> => {
  if (previewForIdIsAlreadyBeingProcessed(previewData?.id)) {
    return
  }

  const requiredProperties = [
    `previewDatabaseId`,
    `id`,
    `token`,
    `remoteUrl`,
    `parentDatabaseId`,
    `modified`,
    `userDatabaseId`,
  ]

  const missingProperties = requiredProperties.filter(
    property => !(property in previewData)
  )

  if (!previewData || missingProperties.length) {
    reporter.warn(
      formatLogMessage(
        `sourcePreview was called but the required previewData properties weren't provided.`
      )
    )
    reporter.info(
      formatLogMessage(
        `Missing properties: \n${JSON.stringify(missingProperties, null, 2)}`
      )
    )
    reporter.log(
      formatLogMessage(`previewData: \n${JSON.stringify(previewData, null, 2)}`)
    )
    return
  }

  await touchValidNodes()

  const sendPreviewStatus = createPreviewStatusCallback({
    previewData,
    reporter,
  })

  // this callback will be invoked when the page is created/updated for this node
  // then it'll send a mutation to WPGraphQL so that WP knows the preview is ready
  store.dispatch.previewStore.subscribeToPagesCreatedFromNodeById({
    nodeId: previewData.id,
    modified: previewData.modified,
    sendPreviewStatus,
  })

  const { node } = await fetchAndCreateSingleNode({
    actionType: `PREVIEW`,
    ...previewData,
    previewParentId: previewData.parentDatabaseId,
    isPreview: true,
  })

  if (
    previewData?.manifestIds?.length &&
    `unstable_createNodeManifest` in actions &&
    node
  ) {
    previewData.manifestIds.forEach(manifestId => {
      actions.unstable_createNodeManifest({
        manifestId,
        node,
      })
    })
  }
}

/**
 * This is called when the /__refresh endpoint is posted to from WP previews.
 * It should only ever run in Preview mode, which is process.env.ENABLE_GATSBY_REFRESH_ENDPOINT = true
 * It first sources all pending preview actions, then calls sourcePreview() for each of them.
 */
export const sourcePreviews = async (helpers: GatsbyHelpers): Promise<void> => {
  const { webhookBody, reporter, actions } = helpers
  const {
    debug: { preview: inPreviewDebugModeOption },
    url,
  } = getPluginOptions()

  // some versions of WPGatsby don't send a remoteUrl on every webhook.
  // if we check this for every webhookBody errors will occur!
  if (webhookBody.remoteUrl) {
    // check if we're receiving preview data fromt the right WP backend
    const { hostname: settingsHostname } = urlUtil.parse(url)
    const { hostname: remoteHostname } = urlUtil.parse(webhookBody.remoteUrl)

    if (settingsHostname !== remoteHostname) {
      const sendPreviewStatus = createPreviewStatusCallback({
        previewData: webhookBody,
        reporter,
      })

      await sendPreviewStatus({
        status: `RECEIVED_PREVIEW_DATA_FROM_WRONG_URL`,
        context: `check that the preview data came from the right URL.`,
        passedNode: {
          modified: webhookBody.modified,
          databaseId: webhookBody.parentDatabaseId,
        },
        graphqlEndpoint: webhookBody.remoteUrl,
      })

      reporter.warn(
        formatLogMessage(
          `Received preview data from a different remote URL than the one specified in plugin options. Preview will not work. Please send preview requests from the WP instance configured in gatsby-config.js.\n\n ${chalk.bold(
            `Remote URL:`
          )} ${webhookBody.remoteUrl}\n ${chalk.bold(
            `Plugin options URL:`
          )} ${url}\n\n`
        )
      )

      return
    }
  }

  const inPreviewDebugMode =
    inPreviewDebugModeOption || process.env.WP_GATSBY_PREVIEW_DEBUG

  if (inPreviewDebugMode) {
    reporter.info(`Sourcing previews for the following webhook:`)
    dump(webhookBody)
  }

  // in case there are preview callbacks from our last build
  await invokeAndCleanupLeftoverPreviewCallbacks({
    status: `GATSBY_PREVIEW_PROCESS_ERROR`,
    context: `Starting sourcePreviews`,
  })

  const wpGatsbyPreviewNodeManifestsAreSupported =
    await remoteSchemaSupportsFieldNameOnTypeName({
      typeName: `GatsbyPreviewData`,
      fieldName: `manifestIds`,
    })

  const previewActions = await paginatedWpNodeFetch({
    contentTypePlural: `actionMonitorActions`,
    nodeTypeName: `ActionMonitor`,
    headers: {
      WPGatsbyPreview: webhookBody.token,
      WPGatsbyPreviewUser: webhookBody.userDatabaseId,
    },
    helpers,
    query: /* GraphQL */ `
      query PREVIEW_ACTIONS($after: String) {
        actionMonitorActions(
          where: {
            previewStream: true
            status: PRIVATE
            orderby: { field: MODIFIED, order: DESC }
            sinceTimestamp: ${
              // only source previews made in the last 60 minutes
              // We delete every preview action we process so this accounts for very long cold builds between previews.
              Date.now() - 1000 * 60 * 60
            }
          }
          first: 100
          after: $after
        ) {
          nodes {
            previewData {
              id
              isDraft
              modified
              parentDatabaseId
              previewDatabaseId
              remoteUrl
              singleName
              userDatabaseId
              ${wpGatsbyPreviewNodeManifestsAreSupported ? `manifestIds` : ``}
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `,
  })

  if (!previewActions?.length) {
    if (inPreviewDebugMode) {
      reporter.info(
        `Preview for id ${webhookBody?.id} returned no action monitor actions.`
      )
    }
    return
  }

  if (inPreviewDebugMode) {
    reporter.info(
      `Preview for id ${webhookBody?.id} returned the following actions:`
    )
    dump(previewActions)
  }

  const queue = getPreviewQueue()

  for (const { previewData } of previewActions) {
    queue.add(() =>
      sourcePreview({
        previewData: { ...previewData, token: webhookBody.token },
        reporter,
        actions,
      })
    )
  }

  await Promise.all([queue.onEmpty(), queue.onIdle()])
}
