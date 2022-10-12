import * as React from "react"
import { Link } from "gatsby"
import { data } from "../../../shared-data/head-function-export"

export default function HeadFunctionExportBasic() {
  return (
    <>
      <h1>I test basic usage for the Head function export</h1>
      <p data-testid="page-component-with-head-export">
        Some other words on your %GATSBY_SITE%
      </p>
      <Link data-testid="gatsby-link" to="/head-function-export/page-query">
        Navigate to page-query via Gatsby Link
      </Link>
      <Link
        data-testid="navigate-to-page-without-head-export"
        to="/without-head"
      >
        Navigate to without head export
      </Link>
    </>
  )
}

export function Head() {
  const {
    base,
    title,
    meta,
    noscript,
    style,
    link,
    extraMeta,
    jsonLD,
  } = data.static

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
      <meta data-testid="extra-meta" name="extra-meta" content={extraMeta} />
      <meta
        data-testid="extra-meta-for-hot-reloading"
        name="extra-meta-for-hot-reloading"
        content="%SOME_EXTRA_META%"
      />
      <script data-testid="jsonLD" type="application/ld+json">
        {jsonLD}
      </script>
      <script type="text/javascript">
        {`window.__SOME_GLOBAL_TO_CHECK_CALL_COUNT__ = (window.__SOME_GLOBAL_TO_CHECK_CALL_COUNT__ || 0 ) + 1`}
      </script>
      Adding-this-text-here-should-not-break-things
    </>
  )
}
