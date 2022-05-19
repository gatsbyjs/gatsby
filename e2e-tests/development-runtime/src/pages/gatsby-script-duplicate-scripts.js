import React from "react"
import { Script } from "gatsby"
import { scripts } from "../../gatsby-script-scripts"
import { onLoad } from "../utils/gatsby-script-callbacks"

function DuplicateScripts() {
  return (
    <main>
      <h1>Load script multiple times </h1>
      <Script
        src={scripts.three}
        strategy="post-hydrate"
        onLoad={() => {
          console.log(`post-hydrate`)
          onLoad(`post-hydrate`)
        }}
      />
      <Script
        src={scripts.three}
        strategy="idle"
        onLoad={() => () => {
          console.log(`idle`)
          onLoad(`idle`)
        }}
      />
    </main>
  )
}

export default DuplicateScripts
