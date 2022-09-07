import React from "react"
import { graphql } from "gatsby"

export default function PageRunningGraphqlResolversOnJSFrontmatterTestInputs({
  data,
}) {
  return <pre>{JSON.stringify(data.allMdx.nodes, null, 2)}</pre>
}

export const query = graphql`
  {
    allMdx(filter: { fields: { slug: { glob: "frontmatter-engine/*" } } }) {
      nodes {
        frontmatter {
          title
        }
        body
        excerpt
        tableOfContents
      }
    }
  }
`
