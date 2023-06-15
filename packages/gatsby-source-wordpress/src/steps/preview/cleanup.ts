import { inPreviewMode, PreviewStatusUnion } from "."
import { OnPageCreatedCallback } from "~/models/preview"
import { getStore } from "~/store"
import { NodePluginArgs } from "gatsby"

/**
 * This callback is invoked to send WP the preview status. In this case the status
 * is that we couldn't find a page for the node being previewed
 */
const invokeLeftoverPreviewCallback =
  ({
    getNode,
    status,
    context,
    error,
  }: {
    status: PreviewStatusUnion
    context?: string
    error?: Error
    getNode: NodePluginArgs["getNode"]
  }) =>
  async ([nodeId, callback]: [
    string,
    OnPageCreatedCallback
  ]): Promise<void> => {
    const passedNode = getNode(nodeId)

    await callback({
      passedNode,
      nodeId,
      // we pass null as the path because no page was created for this node.
      // if it had been, this callback would've been removed earlier in the process
      pageNode: { path: null },
      status,
      context,
      error,
    })
  }

export const invokeAndCleanupLeftoverPreviewCallbacks = async ({
  status,
  context,
  error,
}: {
  status: PreviewStatusUnion
  context?: string
  error?: Error
}): Promise<void> => {
  const state = getStore().getState()

  const { getNode } = state.gatsbyApi.helpers

  const leftoverCallbacks = state.previewStore.nodePageCreatedCallbacks

  const leftoverCallbacksExist = Object.keys(leftoverCallbacks).length

  if (leftoverCallbacksExist) {
    await Promise.all(
      Object.entries(leftoverCallbacks).map(
        invokeLeftoverPreviewCallback({ getNode, status, context, error })
      )
    )

    // after processing our callbacks, we need to remove them all so they don't get called again in the future
    getStore().dispatch.previewStore.clearPreviewCallbacks()
  }
}

/**
 * Preview callbacks are usually invoked during onCreatePage in Gatsby Preview
 * so that we can send back the preview status of a created page to WP
 * In the case that no page is created for the node we're previewing, we'll
 * have callbacks hanging around and WP will not know the status of the preview
 * So in onPreExtractQueries (which runs after pages are created), we check which
 * preview callbacks haven't been invoked, and invoke them with a "NO_PAGE_CREATED_FOR_PREVIEWED_NODE" status, which sends that status to WP
 * After invoking all these leftovers, we clear them out from the store so they aren't called again later.
 */
export const onPreExtractQueriesInvokeLeftoverPreviewCallbacks =
  async (): Promise<void> => {
    if (!inPreviewMode()) {
      return invokeAndCleanupLeftoverPreviewCallbacks({
        status: `GATSBY_PREVIEW_PROCESS_ERROR`,
        context: `Gatsby is not in Preview mode.`,
      })
    }

    // check for any onCreatePageCallbacks that weren't called during createPages
    // we need to tell WP that a page wasn't created for the preview
    return invokeAndCleanupLeftoverPreviewCallbacks({
      status: `NO_PAGE_CREATED_FOR_PREVIEWED_NODE`,
      context: `invokeAndCleanupLeftoverPreviewCallbacks`,
    })
  }
