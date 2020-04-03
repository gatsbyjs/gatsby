import { fetchAndCreateSingleNode } from "~/steps/source-nodes/update-nodes/wp-actions/update"

export const sourcePreviews = async ({ webhookBody }) => {
  if (!webhookBody.preview || !webhookBody.previewId || !webhookBody.token) {
    return
  }

  await fetchAndCreateSingleNode(webhookBody)
}
