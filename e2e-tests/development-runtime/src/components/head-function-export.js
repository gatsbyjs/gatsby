import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"

function HeadComponent({ title: titleOverride, children }) {
  const data = useStaticQuery(graphql`
    query SiteMetaDataStaticQuery {
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
  `)

  const { base, title, author, noscript, color, css } =
    data?.site?.siteMetadata?.headFunctionExport || {}

  return (
    <>
      <base href={base} />
      <title>{titleOverride || title}</title>
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
      {children}
    </>
  )
}

function head() {
  return (
    <>
      <base href="http://localhost:8000" />
      <title>Ella Fitzgerald's Page</title>
      <meta name="author" content="Ella Fitzgerald" />
      <noscript>You take romance - I'll take Jell-O!</noscript>
      <style>
        {`
          h1 {
            color: rebeccapurple;
          }
        `}
      </style>
      <link href="/used-by-head-function-export-basic.css" rel="stylesheet" />
    </>
  )
}

export { head }
export default HeadComponent
