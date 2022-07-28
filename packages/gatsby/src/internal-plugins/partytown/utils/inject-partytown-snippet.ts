import { partytownSnippet } from "@builder.io/partytown/integration"
import { collectedScriptsByPage } from "gatsby-script"
import { getForwards } from "./get-forwards"

export function injectPartytownSnippet(pathname: string): void {
  const collectedScripts = collectedScriptsByPage.get(pathname)

  if (!collectedScripts.length) {
    return
  }

  const existingSnippet = document.querySelector(`[data-partytown]`)

  if (existingSnippet) {
    existingSnippet.remove()
  }

  const forwards = getForwards(collectedScripts)

  const snippet = document.createElement(`script`)
  snippet.dataset.partytown = ``
  snippet.innerHTML = partytownSnippet({ forward: forwards })
  document.head.appendChild(snippet)
}
