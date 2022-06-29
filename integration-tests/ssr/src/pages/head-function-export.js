import React from "react"

export default function PageWithHeadFunctionExport() {
  return <h1>I am a page with a head function export</h1>
}

export function head() {
  return <title data-testid="title">Hello world</title>
}
