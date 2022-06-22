import * as React from "react"

export default function HeadFunctionExportBasic() {
  return (
    <>
      <h1>I test basic usage for the head function export</h1>
      <p>Some other words</p>
    </>
  )
}

export function head() {
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
