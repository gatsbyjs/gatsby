import { formatLogMessage } from "~/utils/format-log-message"
import { getStore } from "~/store"
import { GatsbyNodeApiHelpers } from "~/utils/gatsby-types"
import { inPreviewMode } from "."

/**
 * during onCreatePage we want to figure out which node the page is dependant on
and then store that page in state so we can return info about the page to WordPress
when the page is updated during Previews.
We do that by finding the node id on pageContext.id
Ideally we could detect this without the need for pageContext.id.
There was an attempt to use store.componentDataDependencies but my implementation
was buggy and unreliable. @todo it's worth trying to remove the need for
pageContext.id again in the future.
 */
export const onCreatepageSavePreviewNodeIdToPageDependency = (
  helpers: GatsbyNodeApiHelpers
): void => {
  // if we're not in preview mode we don't want to track this
  if (!inPreviewMode()) {
    return
  }

  const { page, getNode } = helpers

  const nodeThatCreatedThisPage =
    page.context && page.context.id && getNode(page.context.id)

  if (nodeThatCreatedThisPage) {
    getStore().dispatch.previewStore.saveNodePageState({
      nodeId: nodeThatCreatedThisPage.id,
      page: {
        path: page.path,
        updatedAt: page.updatedAt,
      },
    })
  }
}

/**
 * during onCreatePage we check if the node this page was created from
 * has been updated and if it has a callback waiting for it
 * if both of those things are true we invoke the callback to
 * respond to the WP instance preview client
 */
export const onCreatePageRespondToPreviewStatusQuery = async (
  helpers: GatsbyNodeApiHelpers
): Promise<void> => {
  // if we're not in preview mode we don't want to set this up
  if (!inPreviewMode()) {
    return
  }

  const { nodePageCreatedCallbacks, pagePathToNodeDependencyId } =
    getStore().getState().previewStore

  const { page, getNode } = helpers

  if (
    !nodePageCreatedCallbacks ||
    !Object.keys(nodePageCreatedCallbacks).length
  ) {
    return
  }

  const nodeIdThatCreatedThisPage =
    pagePathToNodeDependencyId?.[page.path]?.nodeId

  if (!nodeIdThatCreatedThisPage) {
    return
  }

  const nodePageCreatedCallback =
    nodeIdThatCreatedThisPage &&
    nodePageCreatedCallbacks[nodeIdThatCreatedThisPage]

  if (
    !nodeIdThatCreatedThisPage ||
    typeof nodePageCreatedCallback !== `function`
  ) {
    return
  }

  getStore().dispatch.previewStore.unSubscribeToPagesCreatedFromNodeById({
    nodeId: nodeIdThatCreatedThisPage,
  })

  const nodeThatCreatedThisPage = getNode(nodeIdThatCreatedThisPage)

  if (!nodeThatCreatedThisPage) {
    helpers.reporter.warn(
      formatLogMessage(
        `There was an attempt to call a Preview onPageCreated callback for node ${nodeIdThatCreatedThisPage}, but no node was found.`
      )
    )
    return
  }

  // We need to add the modified time to pageContext so we can read it in WP
  // This way can tell when the updated page has been deployed
  if (!page.context.__wpGatsbyNodeModified) {
    const pageCopy = { ...page }
    pageCopy.context.__wpGatsbyNodeModified = nodeThatCreatedThisPage.modified

    const { deletePage, createPage } = helpers.actions

    deletePage(page)
    createPage(pageCopy)
  }

  await nodePageCreatedCallback({
    passedNode: nodeThatCreatedThisPage,
    pageNode: page,
    context: `onCreatePage Preview callback invocation`,
    status: `PREVIEW_SUCCESS`,
  })
}
