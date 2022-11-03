import * as React from "react"
import { graphql } from "gatsby"

export default function CorrectProps() {
  return (
    <>
      <h1>
        I test usage for the Head function export to make sure all props are
        received
      </h1>
      <p>
        I am created with the <em>createPage</em> API and I receive some
        context
      </p>
    </>
  )
}

export const pageQuery = graphql`
  query MetaDataPageQuery {
    site {
      siteMetadata {
        headFunctionExport {
          base
          title
          meta
          noscript
          style
          link
          extraMeta2
        }
      }
    }
  }
`

export function Head(props) {
  const { data, pageContext, location } = props
  return (
    <>
      <meta
        data-testid="pageContext"
        name="pageContext"
        content={JSON.stringify(pageContext, null, 2)}
      />
      <meta
        data-testid="location"
        name="location"
        content={JSON.stringify(location, null, 2)}
      />
      <meta
        data-testid="data"
        name="data"
        content={JSON.stringify(data, null, 2)}
      />
    </>
  )
}
