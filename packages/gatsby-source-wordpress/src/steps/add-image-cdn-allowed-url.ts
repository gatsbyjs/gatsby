import { join } from "path/posix"
import { getPluginOptions } from "~/utils/get-gatsby-api"

import type { Step } from "~/utils/run-steps"

export const addImageCdnAllowedUrl: Step = ({ actions }): void => {
  if (typeof actions?.addImageCdnAllowedUrl !== `function`) {
    return
  }

  const pluginOptions = getPluginOptions()

  const { url } = pluginOptions

  // url has `/graphql` at the end, so we need to remove it
  const wordpressRootUrl = url.replace(`/graphql`, ``)

  actions.addImageCdnAllowedUrl(join(wordpressRootUrl, `*`))
}
