import { onRenderBody, wrapPageElement } from "./gatsby-shared"
import { hasFeature } from "gatsby-plugin-utils"

/**
 * As of `gatsby@4.15.x` we'll use the Gatsby script component.
 * For prior versions fallback to the original approach.
 * @see {@link https://gatsby.dev/gatsby-script}
 */
if (hasFeature(`gatsby-script`)) {
  exports.wrapPageElement = wrapPageElement
} else {
  exports.onRenderBody = onRenderBody
}
