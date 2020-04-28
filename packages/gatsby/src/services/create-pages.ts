import { IBuildContext } from "../state-machines/develop"

import reporter from "gatsby-cli/lib/reporter"
import apiRunnerNode from "../utils/api-runner-node"
import { boundActionCreators } from "../redux/actions"
const { deletePage, deleteComponentsDependencies } = boundActionCreators

import { differenceWith, isEqualWith } from "lodash"

export async function createPages({
  parentSpan,
  graphqlRunner,
  store,
}: IBuildContext): Promise<{ changedPages: string[]; deletedPages: string[] }> {
  const activity = reporter.activityTimer(`createPages`, {
    parentSpan,
  })
  activity.start()
  const timestamp = Date.now()
  const currentPages = Array.from(store?.getState().pages.values() || [])

  await apiRunnerNode(
    `createPages`,
    {
      graphql: graphqlRunner,
      traceId: `initial-createPages`,
      waitForCascadingActions: true,
      parentSpan: activity.span,
      deferNodeMutation: true,
    },
    { activity }
  )

  const deletedPages: string[] = []
  activity.end()

  // Delete pages that weren't updated when running createPages.
  Array.from(store?.getState().pages.values() || []).forEach(page => {
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

  const newPages = Array.from(store?.getState().pages.values() || [])

  const changedPages = differenceWith(
    newPages,
    currentPages,
    (newPage, oldPage) => {
      if (newPage.path === oldPage.path) {
        return isEqualWith(newPage, oldPage, (_left, _right, key) =>
          key === `updatedAt` ? true : undefined
        )
      } else {
        return false
      }
    }
  ).map(page => page.path)

  return {
    changedPages,
    deletedPages,
  }
}
