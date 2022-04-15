import * as React from "react"
import { ScriptResourceRecords } from "../components/script-resource-records"
import { useOccupyMainThread } from "../hooks/use-occupy-main-thread"
import { scripts } from "../../scripts"
import "../styles/global.css"

// TODO - Import from gatsby core after gatsby-script is in general availability
import { Script, ScriptStrategy } from "gatsby-script"

function IndexPage() {
  useOccupyMainThread()

  return (
    <main>
      <h1>Script component e2e test</h1>
      <ScriptResourceRecords />
      <Script src={scripts.dayjs} strategy={ScriptStrategy.preHydrate} />
      <Script src={scripts.three} strategy={ScriptStrategy.postHydrate} />
      <Script src={scripts.marked} strategy={ScriptStrategy.idle} />
      <Script
        dangerouslySetInnerHTML={{ __html: `console.log('Hello world 1')` }}
      />
      <Script>{`console.log('Hello world 2')`}</Script>
    </main>
  )
}

export default IndexPage
