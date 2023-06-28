import React from "react"

export default function Params({ serverData }) {
  return (
    <div>
      <h1>SSR</h1>
      <div>
        <code>
          <pre>
            {JSON.stringify({ serverData }, null, 2)}
          </pre>
        </code>
      </div>
      <div>
        <code>
          <pre data-testid="query">{JSON.stringify(serverData?.arg?.query)}</pre>
          <pre data-testid="params">{JSON.stringify(serverData?.arg?.params)}</pre>
        </code>
      </div>
    </div>
  )
}

export async function getServerData(arg) {
  return {
    props: {
      arg,
    },
  }
}
