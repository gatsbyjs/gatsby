import * as React from "react"

export default function HeadFunctionExportAllProps(props) {
  return (
    <>
      <h1>
        I test usage for the Head function export to make sure all props are
        received
      </h1>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </>
  )
}

export function Head(props) {
  const { location, pageContext, pageResources, params, path, uri } =
    props || {}

  return (
    <>
      <meta
        data-testid="location.origin"
        name="location.origin"
        content={location?.origin}
      />
      <meta
        data-testid="pageContext"
        name="pageContext"
        content={pageContext}
      />
      <meta
        data-testid="pageResources.page.componentChunkName"
        name="pageResources.page.componentChunkName"
        content={pageResources?.page?.componentChunkName}
      />
      <meta data-testid="params" name="params" content={params} />
      <meta data-testid="path" name="path" content={path} />
      <meta data-testid="uri" name="uri" content={uri} />
    </>
  )
}
