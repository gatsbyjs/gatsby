import * as React from "react"
import { graphql } from "gatsby"

export default function HeadFunctionExportPageQuery() {
  return (
    <>
      <h1>I test usage for the head function export with a page query</h1>
      <p>Some other words</p>
    </>
  )
}

export function head({ data }) {
  const { base, title, author, noscript, color, css } =
    data?.site?.siteMetadata?.headFunctionExport || {}

  return (
    <>
      <base href={base} />
      <title>{title}</title>
      <meta name="author" content={author} />
      <noscript>{noscript}</noscript>
      <style>
        {`
          h1 {
            color: ${color};
          }
        `}
      </style>
      <link href={css} rel="stylesheet" />
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
          author
          noscript
          color
          css
        }
      }
    }
  }
`
