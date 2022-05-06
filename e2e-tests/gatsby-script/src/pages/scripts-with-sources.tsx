import * as React from "react"
import { Link } from "gatsby"
import { ScriptResourceRecords } from "../components/script-resource-records"
import { useOccupyMainThread } from "../hooks/use-occupy-main-thread"
import { scripts, scriptUrls } from "../../scripts"
import { onLoad, onError } from "../utils/callbacks"
import "../styles/global.css"

// TODO - Import from gatsby core after gatsby-script is in general availability
import { Script, ScriptStrategy } from "gatsby-script"

function ScriptsWithSourcesPage() {
  useOccupyMainThread()

  const [renderScriptComponent, setRenderScriptComponent] =
    React.useState(false)
  const toggleRenderScriptComponent = () => 
    setRenderScriptComponent(!renderScriptComponent)
  

  return (
    <main>
      <h1>Script component e2e test</h1>

      <br />

      <ScriptResourceRecords
        check={record =>
          scriptUrls.has(record.name) || record.name.includes(`framework`)
        }
        count={3}
      />

      <br />
      <ul>
        <li>
          <a href="/" id="anchor-link-back-to-index">
            Back to index (anchor)
          </a>
        </li>
        <li>
          <Link to="/" id="gatsby-link-back-to-index">
            Back to index (gatsby-link)
          </Link>
        </li>
      </ul>

      <Script
        src={scripts.three}
        strategy={ScriptStrategy.postHydrate}
        onLoad={() => onLoad(ScriptStrategy.postHydrate)}
      />
      <Script
        src={scripts.marked}
        strategy={ScriptStrategy.idle}
        onLoad={() => onLoad(ScriptStrategy.idle)}
      />

      <Script
        src="/non-existent-script-b.js"
        strategy={ScriptStrategy.postHydrate}
        onError={() => onError(ScriptStrategy.postHydrate)}
      />
      <Script
        src="/non-existent-script-c.js"
        strategy={ScriptStrategy.idle}
        onError={() => onError(ScriptStrategy.idle)}
      />

      <br />
      <button
        data-test-id="script-component-toggle"
        onClick={toggleRenderScriptComponent}
      >
        Toggle render script component[
        {renderScriptComponent ? "unmount" : "mount"}]
      </button>
      {renderScriptComponent && <Script src={scripts.jQuery} />}
    </main>
  )
}

export default ScriptsWithSourcesPage
