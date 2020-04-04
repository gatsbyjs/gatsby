import report from "gatsby-cli/lib/reporter"

import { emitter, store } from "../redux"
import { boundActionCreators } from "../redux/actions"

import apiRunnerNode from "../utils/api-runner-node"

const { deletePage, deleteComponentsDependencies } = boundActionCreators

let pagesDirty = false
let graphql

async function runCreatePages(): Promise<void> {
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
  Array.from(store.getState().pages.values()).forEach((page) => {
    if (
      !page.isCreatedByStatefulCreatePages &&
      page.updatedAt < timestamp &&
      page.path !== `/404.html`
    ) {
      deleteComponentsDependencies([page.path])
      deletePage(page)
    }
  })

  emitter.emit(`CREATE_PAGE_END`)
}

export default function (graphqlRunner): void {
  graphql = graphqlRunner

  emitter.on(`CREATE_NODE`, (action) => {
    if (action.payload.internal.type !== `SitePage`) {
      pagesDirty = true
    }
  })

  emitter.on(`DELETE_NODE`, (action) => {
    if (action.payload.internal.type !== `SitePage`) {
      pagesDirty = true
      // Make a fake API call to trigger `API_RUNNING_QUEUE_EMPTY` being called.
      // We don't want to call runCreatePages here as there might be work in
      // progress. So this is a safe way to make sure runCreatePages gets called
      // at a safe time.
      apiRunnerNode(`FAKE_API_CALL`)
    }
  })

  emitter.on(`API_RUNNING_QUEUE_EMPTY`, () => {
    if (pagesDirty) {
      runCreatePages()
    }
  })
}
