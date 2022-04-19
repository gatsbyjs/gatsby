import * as React from "react"
import { ScriptResourceRecords } from "../components/script-resource-records"
import { ScriptMarkRecords } from "../components/script-mark-records"
import { useOccupyMainThread } from "../hooks/use-occupy-main-thread"
import { scripts, inlineScripts, InlineScript } from "../../scripts"
import "../styles/global.css"

// TODO - Import from gatsby core after gatsby-script is in general availability
import { Script, ScriptStrategy } from "gatsby-script"

function IndexPage() {
  useOccupyMainThread()

  return (
    <main>
      <h1>Script component e2e test</h1>
      <p>
        Note - Response times are delayed in Cypress, so they're only relevant
        compared to other delayed requests (e.g. asserting a post-hydrate script
        loads after the framework loads).
      </p>

      <br />
      <h2>Scripts with sources</h2>
      <ScriptResourceRecords />

      <br />
      <h2>Inline scripts</h2>
      <ScriptMarkRecords />

      <Script src={scripts.dayjs} strategy={ScriptStrategy.preHydrate} />
      <Script src={scripts.three} strategy={ScriptStrategy.postHydrate} />
      <Script src={scripts.marked} strategy={ScriptStrategy.idle} />

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
