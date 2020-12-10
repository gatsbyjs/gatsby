import { emitter, store } from "../redux"
import apiRunnerNode from "../utils/api-runner-node"
import { boundActionCreators } from "../redux/actions"
const { deletePage } = boundActionCreators
import report from "gatsby-cli/lib/reporter"
import {
  ICreateNodeAction,
  IDeleteNodeAction,
  IGatsbyPage,
} from "../redux/types"
import { GraphQLRunner } from "../query/graphql-runner"

let pagesDirty = false
let graphql: GraphQLRunner

const runCreatePages = async (): Promise<void> => {
  pagesDirty = false

  const timestamp = Date.now()

  // Collect pages.
  const activity = report.activityTimer(`createPages`)
  activity.start()
  await apiRunnerNode(
    `createPages`,
    {
      graphql,
      traceId: `createPages`,
      waitForCascadingActions: true,
    },
    { activity }
  )
  activity.end()

  // Delete pages that weren't updated when running createPages.
  Array.from(store.getState().pages.values()).forEach((page: IGatsbyPage) => {
    if (
      !page.isCreatedByStatefulCreatePages &&
      page.updatedAt < timestamp &&
      page.path !== `/404.html`
    ) {
      deletePage(page)
    }
  })

  emitter.emit(`CREATE_PAGE_END`)
}

export const PageHotReloader = (graphqlRunner: GraphQLRunner): void => {
  graphql = graphqlRunner
  emitter.on(`CREATE_NODE`, (action: ICreateNodeAction) => {
    if (action.payload.internal.type !== `SitePage`) {
      pagesDirty = true
    }
  })
  emitter.on(`DELETE_NODE`, (action: IDeleteNodeAction) => {
    if (action.payload.internal.type !== `SitePage`) {
      pagesDirty = true
      // Make a fake API call to trigger `API_RUNNING_QUEUE_EMPTY` being called.
      // We don't want to call runCreatePages here as there might be work in
      // progress. So this is a safe way to make sure runCreatePages gets called
      // at a safe time.
      apiRunnerNode(`FAKE_API_CALL`)
    }
  })

  emitter.on(`API_RUNNING_QUEUE_EMPTY`, (): void => {
    if (pagesDirty) {
      runCreatePages()
    }
  })
}
