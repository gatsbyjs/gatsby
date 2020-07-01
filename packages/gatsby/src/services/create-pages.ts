import reporter from "gatsby-cli/lib/reporter"
import apiRunnerNode from "../utils/api-runner-node"
import { IDataLayerContext } from "../state-machines/data-layer/types"
import { assertStore } from "../utils/assert-store"

export async function createPages({
  parentSpan,
  gatsbyNodeGraphQLFunction,
  store,
}: Partial<IDataLayerContext>): Promise<{
  deletedPages: string[]
  changedPages: string[]
}> {
  assertStore(store)
  const activity = reporter.activityTimer(`createPages`, {
    parentSpan,
  })
  activity.start()
  // const timestamp = Date.now()
  // const currentPages = new Map<string, IGatsbyPage>(store.getState().pages)

  await apiRunnerNode(
    `createPages`,
    {
      graphql: gatsbyNodeGraphQLFunction,
      traceId: `initial-createPages`,
      waitForCascadingActions: true,
      parentSpan: activity.span,
    },
    { activity }
  )
  reporter.verbose(
    `Now have ${store.getState().nodes.size} nodes with ${
      store.getState().nodesByType.size
    } types, and ${
      store.getState().nodesByType?.get(`SitePage`)?.size
    } SitePage nodes`
  )
  activity.end()

  // reporter.info(`Checking for deleted pages`)

  // const deletedPages = deleteUntouchedPages(store.getState().pages, timestamp)

  // reporter.info(
  //   `Deleted ${deletedPages.length} page${deletedPages.length === 1 ? `` : `s`}`
  // )

  // const tim = reporter.activityTimer(`Checking for changed pages`)
  // tim.start()

  // const { changedPages } = findChangedPages(
  //   currentPages,
  //   store.getState().pages
  // )

  // reporter.info(
  //   `Found ${changedPages.length} changed page${
  //     changedPages.length === 1 ? `` : `s`
  //   }`
  // )
  // tim.end()

  return {
    changedPages: [],
    deletedPages: [],
  }
}
