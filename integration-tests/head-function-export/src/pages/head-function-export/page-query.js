import * as React from "react"
import { graphql } from "gatsby"
import { Link } from "gatsby"

export default function HeadFunctionExportPageQuery() {
  return (
    <>
      <h1>I test usage for the Head function export with a page query</h1>
      <p>Some other words</p>
      <Link data-testid="gatsby-link" to="/head-function-export/basic">
        Navigate to basic via Gatsby Link
      </Link>
    </>
  )
}

export function Head({ data }) {
  const { base, title, meta, noscript, style, link } =
    data?.site?.siteMetadata?.headFunctionExport || {}

  return (
    <>
      <base data-testid="base" href={base} />
      <title data-testid="title">{title}</title>
      <meta data-testid="meta" name="author" content={meta} />
      <noscript data-testid="noscript">{noscript}</noscript>
      <style data-testid="style">
        {`
          h1 {
            color: ${style};
          }
        `}
      </style>
      <link data-testid="link" href={link} rel="stylesheet" />
    </>
  )
}

export const pageQuery = graphql`
  query SiteMetaDataPageQuery {
    site {
      siteMetadata {
        headFunctionExport {
          base
          title
          meta
          noscript
          style
          link
        }
      }
    }
  }
`
