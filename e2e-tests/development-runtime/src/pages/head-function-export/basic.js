import * as React from "react"
import { Link } from "gatsby"

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

export function head() {
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
