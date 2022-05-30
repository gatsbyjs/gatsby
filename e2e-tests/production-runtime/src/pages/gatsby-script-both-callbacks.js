import React from "react"
import { Script } from "gatsby"
import { scripts } from "../../gatsby-script-scripts"
import { onLoad, onError } from "../utils/gatsby-script-callbacks"

const BothCallbacksPage = () => {
  return (
    <main>
      <h1>Script component e2e test</h1>

      <Script
        src={scripts.marked}
        onLoad={() => {
          onLoad(`both-callbacks`)
        }}
        onError={() => {}}
      />

      <Script
        src="/non-existent-script.js"
        onLoad={() => {}}
        onError={() => {
          onError(`both-callbacks`)
        }}
      />
    </main>
  )
}

export default BothCallbacksPage
