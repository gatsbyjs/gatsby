import * as React from "react"
import { OccupyMainThread } from "../components/occupy-main-thread"
import { scripts } from "../../scripts"

// TODO - Swap this with released package when available
import { Script, ScriptStrategy } from "../../../../packages/gatsby-script"

function IndexPage() {
  return (
    <main>
      <h1>Script component proof of concept</h1>
      <OccupyMainThread />
      <Script src={scripts.dayjs} strategy={ScriptStrategy.preHydrate} />
      <Script src={scripts.three} strategy={ScriptStrategy.postHydrate} />
      <Script src={scripts.marked} strategy={ScriptStrategy.idle} />
    </main>
  )
}

export default IndexPage
