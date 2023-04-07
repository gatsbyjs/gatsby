import * as React from "react"
import { Link } from "gatsby"
import { data } from "../../../shared-data/head-function-export"

export default function HeadFunctionExportBasic() {
  return (
    <>
      <h1>I test basic usage for the head function export</h1>
      <p>Some other words</p>
      <Link data-testid="gatsby-link" to="/head-function-export/page-query">
        Navigate to page-query via Gatsby Link
      </Link>
    </>
  )
}

export function Head() {
  const { base, title, meta, noscript, style, link, jsonLD } = data.static

  return (
    <>
      <base data-testid="base" href={base} />
      <title data-testid="title">{title} {title}</title>
      <meta data-testid="meta" name="author" content={meta} />
      <noscript data-testid="noscript">{noscript}</noscript>
      <style data-testid="style">
        {`
          h1 {
            color: rebeccapurple;
            font-family: '${style}'
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
