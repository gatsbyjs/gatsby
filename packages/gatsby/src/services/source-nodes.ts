import { IBuildContext } from "../state-machines/develop"
import sourceNodesAndGc from "../utils/source-nodes"
import reporter from "gatsby-cli/lib/reporter"
import { findChangedPages } from "../utils/check-for-changed-pages"

export async function sourceNodes({
  parentSpan,
  webhookBody,
  store,
}: Partial<IBuildContext>): Promise<{
  changedPages: string[]
  deletedPages: string[]
} | void> {
  if (!store) {
    reporter.panic(`No redux store`)
    return void 0
  }
  const activity = reporter.activityTimer(`source and transform nodes`, {
    parentSpan,
  })
  console.log({ webhookBody })
  activity.start()
  const currentPages = new Map(store.getState().pages)
  await sourceNodesAndGc({
    parentSpan: activity.span,
    deferNodeMutation: !!(webhookBody && Object.keys(webhookBody).length),
    webhookBody,
  })
  reporter.info(`Checking for deleted pages`)

  const tim = reporter.activityTimer(`Checking for changed pages`)
  tim.start()

  const { changedPages, deletedPages } = findChangedPages(
    currentPages,
    store.getState().pages
  )

  reporter.info(
    `Deleted ${deletedPages.length} page${deletedPages.length === 1 ? `` : `s`}`
  )

  reporter.info(
    `Found ${changedPages.length} changed page${
      changedPages.length === 1 ? `` : `s`
    }`
  )
  tim.end()

  activity.end()
  return {
    deletedPages,
    changedPages,
  }
}
