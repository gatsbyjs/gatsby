import * as React from "react"
import { scriptUrls } from "../../scripts"
import { ScriptResourceRecords } from "../components/script-resource-records"
import "../styles/global.css"

function AddScriptsViaGatsbyBrowser() {
  return (
    <div>
      <h1> Gatsby browser </h1>
      <h3>
        Scripts loaded via wrapPageElement
      </h3>

      <ScriptResourceRecords
        check={record => record.name.includes(`jquery`)}
        count={1}
      />

      <h3>
        Scripts loaded via wrapRootElement
      </h3>

      <ScriptResourceRecords
        check={record => record.name.includes(`popper`)}
        count={1}
      />
    </div>
  )
}

export default AddScriptsViaGatsbyBrowser
