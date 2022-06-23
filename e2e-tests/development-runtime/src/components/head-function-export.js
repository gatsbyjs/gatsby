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
      <base data-testid="base" href={base} />
      <title data-testid="title">{titleOverride || title}</title>
      <meta data-testid="meta" name="author" content={author} />
      <noscript data-testid="noscript">{noscript}</noscript>
      <style data-testid="style">
        {`
          h1 {
            color: ${color};
          }
        `}
      </style>
      <link data-testid="link" href={css} rel="stylesheet" />
      {children}
    </>
  )
}

function head() {
  return (
    <>
      <base data-testid="base" href="http://localhost:8000" />
      <title data-testid="title">Ella Fitzgerald's Page</title>
      <meta data-testid="meta" name="author" content="Ella Fitzgerald" />
      <noscript data-testid="noscript">
        You take romance - I'll take Jell-O!
      </noscript>
      <style data-testid="style">
        {`
          h1 {
            color: rebeccapurple;
          }
        `}
      </style>
      <link
        data-testid="link"
        href="/used-by-head-function-export-basic.css"
        rel="stylesheet"
      />
    </>
  )
}

export { head }
export default HeadComponent
