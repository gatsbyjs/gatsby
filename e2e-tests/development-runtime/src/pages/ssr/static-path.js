import React from "react"
import path from "path"
import * as fs from "fs"

export default function StaticPath({ serverData }) {
  return (
    <div>
      <h2>Query</h2>
      <pre data-testid="query">{JSON.stringify(serverData?.arg?.query)}</pre>
      <h2>Params</h2>
      <pre data-testid="params">{JSON.stringify(serverData?.arg?.params)}</pre>
      <h2>Debug</h2>
      <pre>{JSON.stringify({ serverData }, null, 2)}</pre>
    </div>
  )
}

export function getServerData(arg) {
  const pkgJSON = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../../package.json"), "utf8")
  )

  return {
    props: {
      version: pkgJSON.version,
      arg,
    },
  }
}
