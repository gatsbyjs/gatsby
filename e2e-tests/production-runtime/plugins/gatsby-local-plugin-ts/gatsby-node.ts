import { GatsbyNode } from "gatsby"

export const onCreatePage: GatsbyNode["onCreatePage"] = ({ page, actions }) => {
  if (!/local-plugin-ts/.test(page.path)) {
    return
  }
  const { createPage, deletePage } = actions
  deletePage(page)
  createPage({
    ...page,
    context: {
      ...page.context,
      hello: `I am injected by a local plugin with a gatsby-node.ts file`,
    },
  })
}
