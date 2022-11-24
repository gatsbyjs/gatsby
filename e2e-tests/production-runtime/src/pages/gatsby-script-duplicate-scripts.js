import React, { useState } from "react"
import { Script } from "gatsby"
import { scripts } from "../../gatsby-script-scripts"
import { onLoad, onError } from "../utils/gatsby-script-callbacks"

const DuplicateScriptsPage = () => {
  const [onLoadScriptLoaded, setOnLoadScriptLoaded] = useState(false)
  const [onErrorScriptLoaded, setOnErrorScriptLoaded] = useState(false)

  return (
    <main>
      <h1>Script component e2e test</h1>

      <Script
        src={scripts.marked}
        onLoad={() => {
          onLoad(`duplicate-1`)
        }}
      />
      <Script
        src={scripts.marked}
        onLoad={() => {
          onLoad(`duplicate-2`)
          setOnLoadScriptLoaded(true)
        }}
      />
      {onLoadScriptLoaded && (
        <Script
          src={scripts.marked}
          onLoad={() => {
            onLoad(`duplicate-3`)
          }}
        />
      )}

      <Script
        src="/non-existent-script.js"
        onError={() => {
          onError(`duplicate-1`)
        }}
      />
      <Script
        src="/non-existent-script.js"
        onError={() => {
          onError(`duplicate-2`)
          setOnErrorScriptLoaded(true)
        }}
      />
      {onErrorScriptLoaded && (
        <Script
          src="/non-existent-script.js"
          onError={() => {
            onError(`duplicate-3`)
          }}
        />
      )}
    </main>
  )
}

export default DuplicateScriptsPage
