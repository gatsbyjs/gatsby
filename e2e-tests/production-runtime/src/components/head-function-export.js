import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { data } from "../../shared-data/head-function-export.js"

function HeadComponent({ children }) {
  const data = useStaticQuery(graphql`
    query SiteMetaDataStaticQuery {
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
  `)

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
      {children}
    </>
  )
}

function Head() {
  const { base, title, meta, noscript, style, link, jsonLD } = data.static

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
      <script data-testid="jsonLD" type="application/ld+json">
        {jsonLD}
      </script>
    </>
  )
}

export { Head }
export default HeadComponent
