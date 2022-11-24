import * as React from "react"
import { Link, Script } from "gatsby"
import { ScriptResourceRecords } from "../components/gatsby-script-resource-records"
import { ScriptMarkRecords } from "../components/gatsby-script-mark-records"
import { useOccupyMainThread } from "../hooks/use-occupy-main-thread"
import { inlineScripts, inlineScript } from "../../gatsby-script-scripts"

function InlineScriptsPage() {
  useOccupyMainThread()

  return (
    <main style={{ margin: `1em` }}>
      <h1>Script component e2e test</h1>

      <br />
      <h2>Framework script</h2>
      <ScriptResourceRecords
        check={record => record.name.includes(`framework`)}
        count={1}
      />

      <br />
      <h2>Inline scripts</h2>
      <ScriptMarkRecords
        check={record => record.name === `inline-script`}
        count={4}
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
        id={`${inlineScript.dangerouslySet}-post-hydrate`}
        strategy="post-hydrate"
        dangerouslySetInnerHTML={{
          __html: inlineScripts[inlineScript.dangerouslySet][`post-hydrate`],
        }}
      />
      <Script
        id={`${inlineScript.dangerouslySet}-idle`}
        strategy="idle"
        dangerouslySetInnerHTML={{
          __html: inlineScripts[inlineScript.dangerouslySet][`idle`],
        }}
      />

      <Script
        id={`${inlineScript.templateLiteral}-post-hydrate`}
        strategy="post-hydrate"
      >
        {inlineScripts[inlineScript.templateLiteral][`post-hydrate`]}
      </Script>
      <Script id={`${inlineScript.templateLiteral}-idle`} strategy="idle">
        {inlineScripts[inlineScript.templateLiteral][`idle`]}
      </Script>
    </main>
  )
}

export default InlineScriptsPage
