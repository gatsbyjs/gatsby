import * as React from "react"
import { OccupyMainThread } from "../components/occupy-main-thread"

// TODO - Swap this with released package when available
import { Script, ScriptStrategy } from "../../../../packages/gatsby-script"

// Example script sources
const scripts = {
  dayjs: "https://cdn.jsdelivr.net/npm/dayjs@1.11.0/dayjs.min.js",
  three: "https://unpkg.com/three@0.139.1/build/three.js",
  marked: "https://cdn.jsdelivr.net/npm/marked/marked.min.js",
}

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
