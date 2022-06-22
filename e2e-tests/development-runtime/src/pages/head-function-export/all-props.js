import * as React from "react"

export default function HeadFunctionExportAllProps() {
  return (
    <>
      <h1>
        I test usage for the head function export to make sure all props are
        received
      </h1>
    </>
  )
}

export function getServerData() {
  return {
    hello: `world`,
  }
}

export function head(props) {
  const { location, pageResources, params, path, uri } = props || {}

  return (
    <>
      <meta name="location.origin" content={location.origin} />
      <meta name="pageContext" content="TODO" />
      <meta
        name="pageResources.page.componentChunkName"
        content={pageResources.page.componentChunkName}
      />
      <meta name="params" content={params?.hello} />
      <meta name="path" content={path} />
      <meta name="getServerData" content={getServerData?.hello} />
      <meta name="uri" content={uri} />
    </>
  )
}
