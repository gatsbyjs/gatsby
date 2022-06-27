import React, { useState } from "react"
import { Script } from "gatsby"
import { scripts } from "../../gatsby-script-scripts"
import { onLoad, onError } from "../utils/gatsby-script-callbacks"

const DuplicateScriptsPage = () => {
  const [onLoadScriptLoaded, setOnLoadScriptLoaded] = useState(false)
  const [onErrorScriptLoaded, setOnErrorScriptLoaded] = useState(false)
  const [secondOnLoadScriptLoaded, setSecondOnLoadScriptLoaded] = useState(
    false
  )
  const [secondOnErrorScriptLoaded, setSecondOnErrorScriptLoaded] = useState(
    false
  )

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

      <Script src={scripts.three} />
      <Script
        src={scripts.three}
        onLoad={() => {
          onLoad(`duplicate-first-script-no-callback`)
          setSecondOnLoadScriptLoaded(true)
        }}
      />
      {secondOnLoadScriptLoaded && (
        <Script
          src={scripts.three}
          onLoad={() => {
            onLoad(`duplicate-first-script-no-callback-2`)
          }}
        />
      )}

      <Script src="/other-non-existent-script.js" />
      <Script
        src="/other-non-existent-script.js"
        onError={() => {
          onError(`duplicate-first-script-no-callback`)
          setSecondOnErrorScriptLoaded(true)
        }}
      />
      {secondOnErrorScriptLoaded && (
        <Script
          src="/other-non-existent-script.js"
          onError={() => {
            onError(`duplicate-first-script-no-callback-2`)
          }}
        />
      )}
    </main>
  )
}

export default DuplicateScriptsPage
