import * as React from "react"

export default function HeadFunctionExportFsRouteApi() {
  return (
    <>
      <h1>I test usage for the Head function export with the FS Route API</h1>
    </>
  )
}

export function Head(props) {
  const { pageContext } = props || {}

  return <title data-testid="title">{pageContext.slug}</title>
}
