import * as React from "react"

export default function HeadFunctionExportFsRouteApi(props) {
  return (
    <>
      <h1>I test usage for the Head function export with the FS Route API</h1>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </>
  )
}

export function Head(props) {
  const { pageContext } = props || {}

  return <title data-testid="title">{pageContext.slug}</title>
}
