import * as React from "react"
import { Link, Script } from "gatsby"
import { ScriptResourceRecords } from "../components/gatsby-script-resource-records"
import { useOccupyMainThread } from "../hooks/use-occupy-main-thread"
import { scripts, scriptUrls } from "../../gatsby-script-scripts"
import { onLoad, onError } from "../utils/gatsby-script-callbacks"

function ScriptsWithSourcesPage() {
  useOccupyMainThread()

  return (
    <main style={{ margin: `1em` }}>
      <h1>Script component e2e test</h1>

      <br />
      <h2>Scripts with sources</h2>
      <ScriptResourceRecords
        check={record =>
          scriptUrls.has(record.name) || record.name.includes(`framework`)
        }
        count={5} // Include scripts from ssr/browser APIs
      />

      <br />
      <ul>
        <li>
          <a href="/gatsby-script-navigation/" id="anchor-link-back-to-index">
            Back to navigation page (anchor)
          </a>
        </li>
        <li>
          <Link to="/gatsby-script-navigation/" id="gatsby-link-back-to-index">
            Back to navigation page (gatsby-link)
          </Link>
        </li>
      </ul>

      <Script
        src={scripts.three}
        strategy="post-hydrate"
        onLoad={() => onLoad(`post-hydrate`)}
      />
      <Script
        src={scripts.marked}
        strategy="idle"
        onLoad={() => onLoad(`idle`)}
      />

      <Script
        src="/non-existent-script-b.js"
        strategy="post-hydrate"
        onError={() => onError(`post-hydrate`)}
      />
      <Script
        src="/non-existent-script-c.js"
        strategy="idle"
        onError={() => onError(`idle`)}
      />
    </main>
  )
}

export default ScriptsWithSourcesPage
