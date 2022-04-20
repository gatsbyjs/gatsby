import * as React from "react"
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
      <h2>Inline scripts</h2>
      <ScriptMarkRecords />

      <Script
        strategy={ScriptStrategy.preHydrate}
        dangerouslySetInnerHTML={{
          __html:
            inlineScripts[InlineScript.dangerouslySet][
              ScriptStrategy.preHydrate
            ],
        }}
      />
      <Script
        strategy={ScriptStrategy.postHydrate}
        dangerouslySetInnerHTML={{
          __html:
            inlineScripts[InlineScript.dangerouslySet][
              ScriptStrategy.postHydrate
            ],
        }}
      />
      <Script
        strategy={ScriptStrategy.idle}
        dangerouslySetInnerHTML={{
          __html:
            inlineScripts[InlineScript.dangerouslySet][ScriptStrategy.idle],
        }}
      />

      <Script strategy={ScriptStrategy.preHydrate}>
        {inlineScripts[InlineScript.templateLiteral][ScriptStrategy.preHydrate]}
      </Script>
      <Script strategy={ScriptStrategy.postHydrate}>
        {
          inlineScripts[InlineScript.templateLiteral][
            ScriptStrategy.postHydrate
          ]
        }
      </Script>
      <Script strategy={ScriptStrategy.idle}>
        {inlineScripts[InlineScript.templateLiteral][ScriptStrategy.idle]}
      </Script>
    </main>
  )
}

export default IndexPage
