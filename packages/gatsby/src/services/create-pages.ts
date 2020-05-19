import { IBuildContext } from "../state-machines/develop"

import reporter from "gatsby-cli/lib/reporter"
import apiRunnerNode from "../utils/api-runner-node"
import { boundActionCreators } from "../redux/actions"
const { deletePage, deleteComponentsDependencies } = boundActionCreators

import { isEqualWith, IsEqualCustomizer } from "lodash"

export async function createPages({
  parentSpan,
  graphqlRunner,
  store,
}: IBuildContext): Promise<{ changedPages: string[]; deletedPages: string[] }> {
  if (!store) {
    reporter.panic(`store not initialized`)
    return {
      changedPages: [],
      deletedPages: [],
    }
  }
  const activity = reporter.activityTimer(`createPages`, {
    parentSpan,
  })
  activity.start()
  const timestamp = Date.now()
  const currentPages = new Map(store.getState().pages)

  await apiRunnerNode(
    `createPages`,
    {
      graphql: graphqlRunner,
      traceId: `initial-createPages`,
      waitForCascadingActions: true,
      parentSpan: activity.span,
    },
    { activity }
  )

  const deletedPages: string[] = []
  activity.end()

  reporter.info(`Checking for deleted pages`)
  // Delete pages that weren't updated when running createPages.
  store.getState().pages.forEach(page => {
    if (
      !page.isCreatedByStatefulCreatePages &&
      page.updatedAt < timestamp &&
      page.path !== `/404.html`
    ) {
      deleteComponentsDependencies([page.path])
      deletePage(page)
      deletedPages.push(page.path, `/page-data${page.path}`)
    }
  })
  reporter.info(
    `Deleted ${deletedPages.length} page${deletedPages.length === 1 ? `` : `s`}`
  )

  const tim = reporter.activityTimer(`Checking for changed pages`)
  tim.start()

  const changedPages: string[] = []

  const compareWithoutUpdated: IsEqualCustomizer = (_left, _right, key) =>
    key === `updatedAt` || undefined

  store.getState().pages.forEach((newPage, key) => {
    const oldPage = currentPages.get(key)
    if (!oldPage || !isEqualWith(newPage, oldPage, compareWithoutUpdated)) {
      changedPages.push(key)
    }
  })

  reporter.info(
    `Found ${changedPages.length} changed page${
      changedPages.length === 1 ? `` : `s`
    }`
  )
  tim.end()

  return {
    changedPages,
    deletedPages,
  }
}
