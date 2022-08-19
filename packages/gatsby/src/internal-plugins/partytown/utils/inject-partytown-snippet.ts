import { partytownSnippet } from "@builder.io/partytown/integration"
import { ScriptProps } from "gatsby-script"
import { getForwards } from "./get-forwards"

// Adapted from https://github.com/BuilderIO/partytown/blob/main/src/react/snippet.tsx to only include CSR logic
export function injectPartytownSnippet(
  collectedScripts: Array<ScriptProps>
): void {
  if (!collectedScripts.length) {
    return
  }

  const existingSnippet = document.querySelector(`script[data-partytown]`)
  const existingSandbox = document.querySelector(
    `iframe[src*="~partytown/partytown-sandbox-sw"]`
  )

  if (existingSnippet) {
    existingSnippet.remove()
  }

  if (existingSandbox) {
    existingSandbox.remove()
  }

  const forwards = getForwards(collectedScripts)

  const snippet = document.createElement(`script`)
  snippet.dataset.partytown = ``
  snippet.innerHTML = partytownSnippet({ forward: forwards })
  document.head.appendChild(snippet)
}
