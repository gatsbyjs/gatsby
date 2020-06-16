import { IBuildContext } from "./"
import sourceNodesAndRemoveStaleNodes from "../utils/source-nodes"
import reporter from "gatsby-cli/lib/reporter"
// import { findChangedPages } from "../utils/check-for-changed-pages"
// import { IGatsbyPage } from "../redux/types"

export async function sourceNodes({
  parentSpan,
  webhookBody,
  store,
}: Partial<IBuildContext>): Promise<void> {
  if (!store) {
    reporter.panic(`No redux store`)
  }
  const activity = reporter.activityTimer(`source and transform nodes`, {
    parentSpan,
  })
  activity.start()
  // const currentPages = new Map<string, IGatsbyPage>(store.getState().pages)
  await sourceNodesAndRemoveStaleNodes({
    parentSpan: activity.span,
    // deferNodeMutation: !!(webhookBody && Object.keys(webhookBody).length), // Coming soon
    webhookBody,
  })

  reporter.verbose(
    `Now have ${store.getState().nodes.size} nodes with ${
      store.getState().nodesByType.size
    } types: [${[...store.getState().nodesByType.entries()]
      .map(([type, nodes]) => type + `:` + nodes.size)
      .join(`, `)}]`
  )

  // reporter.info(`Checking for deleted pages`)

  // Add this back when we enable page creation outside of onCreatePages
  // const tim = reporter.activityTimer(`Checking for changed pages`)
  // tim.start()

  // const { changedPages, deletedPages } = findChangedPages(
  //   currentPages,
  //   store.getState().pages
  // )

  // reporter.info(
  //   `Deleted ${deletedPages.length} page${deletedPages.length === 1 ? `` : `s`}`
  // )

  // reporter.info(
  //   `Found ${changedPages.length} changed page${
  //     changedPages.length === 1 ? `` : `s`
  //   }`
  // )
  // tim.end()

  activity.end()
  // return {
  //   deletedPages,
  //   changedPages,
  // }
}
