import reporter from "gatsby-cli/lib/reporter"
import apiRunnerNode from "../utils/api-runner-node"
import { IDataLayerContext } from "../state-machines/data-layer/types"
import { assertStore } from "../utils/assert-store"
import { IGatsbyPage } from "../redux/types"
import { actions } from "../redux/actions"
import { deleteUntouchedPages, findChangedPages } from "../utils/changed-pages"
import { getDataStore } from "../datastore"

export async function createPages({
  parentSpan,
  gatsbyNodeGraphQLFunction,
  store,
  deferNodeMutation,
  shouldRunCreatePagesStatefully,
}: Partial<IDataLayerContext>): Promise<{
  deletedPages: Array<string>
  changedPages: Array<string>
}> {
  assertStore(store)
  const activity = reporter.activityTimer(`createPages`, {
    parentSpan,
  })
  activity.start()
  const timestamp = Date.now()
  const currentPages = new Map<string, IGatsbyPage>(store.getState().pages)
  await apiRunnerNode(
    `createPages`,
    {
      graphql: gatsbyNodeGraphQLFunction,
      traceId: `initial-createPages`,
      waitForCascadingActions: true,
      parentSpan: activity.span,
      deferNodeMutation,
    },
    { activity }
  )
  activity.end()

  if (shouldRunCreatePagesStatefully) {
    const activity = reporter.activityTimer(`createPagesStatefully`, {
      parentSpan,
    })
    activity.start()
    await apiRunnerNode(
      `createPagesStatefully`,
      {
        graphql: gatsbyNodeGraphQLFunction,
        traceId: `initial-createPagesStatefully`,
        waitForCascadingActions: true,
        parentSpan: activity.span,
        deferNodeMutation,
      },
      {
        activity,
      }
    )
    activity.end()
  }

  const dataStore = getDataStore()
  reporter.info(
    `Total nodes: ${dataStore.countNodes()}, ` +
      `SitePage nodes: ${
        store.getState().pages.size
      } (use --verbose for breakdown)`
  )

  if (process.env.gatsby_log_level === `verbose`) {
    const types = dataStore.getTypes()
    reporter.verbose(
      `Number of node types: ${types.length}. Nodes per type: ${types
        .map(type => type + `: ` + dataStore.countNodes(type))
        .join(`, `)}`
    )
  }

  reporter.verbose(`Checking for deleted pages`)

  const deletedPages = deleteUntouchedPages(
    store.getState().pages,
    timestamp,
    !!shouldRunCreatePagesStatefully
  )

  reporter.verbose(
    `Deleted ${deletedPages.length} page${deletedPages.length === 1 ? `` : `s`}`
  )

  const tim = reporter.activityTimer(`Checking for changed pages`)
  tim.start()

  const { changedPages } = findChangedPages(
    currentPages,
    store.getState().pages
  )

  reporter.verbose(
    `Found ${changedPages.length} changed page${
      changedPages.length === 1 ? `` : `s`
    }`
  )
  tim.end()

  store.dispatch(actions.apiFinished({ apiName: `createPages` }))

  return {
    changedPages,
    deletedPages,
  }
}
