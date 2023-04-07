import React from "react"

export default function PageWithHeadFunctionExport() {
  return <h1>I am a page with a Head function export</h1>
}

export function Head() {
  return (
    <>
      <html lang="fr" data-foo="bar" />
      <body data-foo="baz" />
      <title data-testid="title">Hello world</title>
    </>
  )
}
