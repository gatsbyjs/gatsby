import * as React from "react"
import { Link } from "gatsby"
import { ScriptResourceRecords } from "../components/script-resource-records"
import { ScriptMarkRecords } from "../components/script-mark-records"
import { useOccupyMainThread } from "../hooks/use-occupy-main-thread"
import { inlineScripts, InlineScript } from "../../scripts"
import "../styles/global.css"

// TODO - Import from gatsby core after gatsby-script is in general availability
import { Script, ScriptStrategy } from "gatsby-script"

function IndexPage() {
  useOccupyMainThread()

  return (
    <main>
      <h1>Script component e2e test</h1>

      <br />
      <h2>Framework script</h2>
      <ScriptResourceRecords
        check={record => record.name.includes(`framework`)}
        count={1}
      />

      <br />
      <h2>Inline scripts</h2>
      <ScriptMarkRecords />

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
        id={`${InlineScript.dangerouslySet}-${ScriptStrategy.preHydrate}`}
        strategy={ScriptStrategy.preHydrate}
        dangerouslySetInnerHTML={{
          __html:
            inlineScripts[InlineScript.dangerouslySet][
              ScriptStrategy.preHydrate
            ],
        }}
      />
      <Script
        id={`${InlineScript.dangerouslySet}-${ScriptStrategy.postHydrate}`}
        strategy={ScriptStrategy.postHydrate}
        dangerouslySetInnerHTML={{
          __html:
            inlineScripts[InlineScript.dangerouslySet][
              ScriptStrategy.postHydrate
            ],
        }}
      />
      <Script
        id={`${InlineScript.dangerouslySet}-${ScriptStrategy.idle}`}
        strategy={ScriptStrategy.idle}
        dangerouslySetInnerHTML={{
          __html:
            inlineScripts[InlineScript.dangerouslySet][ScriptStrategy.idle],
        }}
      />

      <Script
        id={`${InlineScript.templateLiteral}-${ScriptStrategy.preHydrate}`}
        strategy={ScriptStrategy.preHydrate}
      >
        {inlineScripts[InlineScript.templateLiteral][ScriptStrategy.preHydrate]}
      </Script>
      <Script
        id={`${InlineScript.templateLiteral}-${ScriptStrategy.postHydrate}`}
        strategy={ScriptStrategy.postHydrate}
      >
        {
          inlineScripts[InlineScript.templateLiteral][
            ScriptStrategy.postHydrate
          ]
        }
      </Script>
      <Script
        id={`${InlineScript.templateLiteral}-${ScriptStrategy.idle}`}
        strategy={ScriptStrategy.idle}
      >
        {inlineScripts[InlineScript.templateLiteral][ScriptStrategy.idle]}
      </Script>
    </main>
  )
}

export default IndexPage
