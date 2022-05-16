import React from "react"
import { Link, Script, ScriptStrategy } from "gatsby"
import { scripts, scriptUrls } from "../../scripts"
import { onLoad, onError } from "../utils/callbacks"

/**
 * Load threejs multiple times
 * Should log some warning to the console
 */
function DuplicateScripts() {
  return (
    <main>
      <h1>Load script multiple times </h1>
      <Script
        src={scripts.three}
        strategy={ScriptStrategy.postHydrate}
        onLoad={() => onLoad(ScriptStrategy.postHydrate)}
      />
      <Script
        src={scripts.three}
        strategy={ScriptStrategy.idle}
        onLoad={() => onLoad(ScriptStrategy.idle)}
      />
    </main>
  )
}

export default DuplicateScripts
