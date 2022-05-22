import * as React from "react"
import { ScriptResourceRecords } from "../components/gatsby-script-resource-records"
import { useOccupyMainThread } from "../hooks/use-occupy-main-thread"
import { scriptUrls } from "../../gatsby-script-scripts"

function ScriptsFromSSRAndBrowserAPIs() {
  useOccupyMainThread()

  return (
    <main style={{ margin: `1em` }}>
      <h1>Script component e2e test</h1>

      <br />
      <h2>Scripts loaded via wrapPageElement and wrapRootElement</h2>

      <ScriptResourceRecords
        check={record => scriptUrls.has(record.name)}
        count={4}
      />
    </main>
  )
}

export default ScriptsFromSSRAndBrowserAPIs
