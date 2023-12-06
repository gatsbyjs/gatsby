import nodePath from "path"
import { getStore } from "~/store"

import type { Step } from "~/utils/run-steps"

export const addImageCdnAllowedUrl: Step = ({ actions }): void => {
  if (typeof actions?.addImageCdnAllowedUrl !== `function`) {
    return
  }

  const { wpUrl } = getStore().getState().remoteSchema

  if (!wpUrl) {
    return
  }

  const wordpressUrl = new URL(wpUrl)
  wordpressUrl.pathname = nodePath.posix.join(wordpressUrl.pathname, `*`)

  actions.addImageCdnAllowedUrl(wordpressUrl.href)
}
