import React from "react"
import { graphql } from "gatsby"

export default function StaticPath({ data, serverData }) {
  return (
    <>
      <pre data-testid="field-result">
        {JSON.stringify(
          data?.fieldWithResolverThatMakeUseOfImportWithNodeProtocol
        )}
      </pre>
      <pre data-testid="is-ssr">
        {JSON.stringify(serverData?.usingEngines ?? false)}
      </pre>
    </>
  )
}

// just mark it as page that will use engine
export async function getServerData() {
  return {
    props: {
      usingEngines: true,
    },
  }
}

export const q = graphql`
  {
    fieldWithResolverThatMakeUseOfImportWithNodeProtocol(
      left: "foo"
      right: "bar"
    )
  }
`
