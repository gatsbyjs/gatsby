import { fetchAndCreateSingleNode } from "~/steps/source-nodes/update-nodes/wp-actions/update"

export const sourcePreviews = async ({ webhookBody }) => {
  if (!webhookBody.preview) {
    return
  }

  await fetchAndCreateSingleNode(webhookBody)
}
