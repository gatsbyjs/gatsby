import nodePath from "path"
import { getPluginOptions } from "~/utils/get-gatsby-api"

import type { Step } from "~/utils/run-steps"

export const addImageCdnAllowedUrl: Step = ({ actions }): void => {
  if (typeof actions?.addImageCdnAllowedUrl !== `function`) {
    return
  }

  const pluginOptions = getPluginOptions()

  const { url } = pluginOptions

  // url has `/graphql` at the end, so we need to remove it
  // todo: use siteUrl from wpGraphql instead of url and trying to replace graphql
  const wordpressRootUrl = url.replace(`/graphql`, ``)

  actions.addImageCdnAllowedUrl(nodePath.posix.join(wordpressRootUrl, `*`))
}
