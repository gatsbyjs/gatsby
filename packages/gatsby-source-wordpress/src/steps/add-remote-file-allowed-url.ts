import nodePath from "path"
import { getStore } from "~/store"

import type { Step } from "~/utils/run-steps"

export const addRemoteFileAllowedUrl: Step = ({ actions }): void => {
  if (typeof actions?.addRemoteFileAllowedUrl !== `function`) {
    return
  }

  const { wpUrl } = getStore().getState().remoteSchema

  if (!wpUrl) {
    return
  }

  const wordpressUrl = new URL(wpUrl)
  wordpressUrl.pathname = nodePath.posix.join(wordpressUrl.pathname, `*`)

  actions.addRemoteFileAllowedUrl(wordpressUrl.href)
}
