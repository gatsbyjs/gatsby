import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import scopeContexts from "../loaders/mdx-scopes"
import MDXRenderer from "../mdx-renderer"
import { plugins as wrappers } from "../loaders/mdx-wrappers"

/*
 * A function that you can pass an mdx body to and get back html
 */
export default body => {
  const wrappedElement = wrappers.reduce(
    (element, plugin) => plugin.wrapRootElement({ element }, {}),
    <MDXRenderer scope={scopeContexts} isHTMLRenderPass>
      {body}
    </MDXRenderer>
  )
  return renderToStaticMarkup(wrappedElement)
}
