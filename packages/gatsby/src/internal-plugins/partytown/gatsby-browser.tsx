import { collectedScriptsByPage } from "gatsby-script"
import type { GatsbyBrowser } from "gatsby"
import type { ScriptProps } from "gatsby-script"
import { partytownSnippet } from "@builder.io/partytown/integration"

function getForwards(pathname: string): Array<string> {
  const collectedScripts = collectedScriptsByPage.get(pathname)
  const forwards = collectedScripts?.flatMap(
    (script: ScriptProps) => script?.forward || []
  )
  return forwards
}

function injectPartytownSnippet(pathname: string): void {
  const existingSnippet = document.querySelector(`[data-partytown]`)

  if (existingSnippet) {
    existingSnippet.remove()
  }

  const forwards = getForwards(pathname)

  const snippet = document.createElement(`script`)
  snippet.dataset.partytown = ``
  snippet.innerHTML = partytownSnippet({ forward: forwards })
  document.head.appendChild(snippet)
}

export const onInitialClientRender: GatsbyBrowser[`onInitialClientRender`] =
  (): void => {
    injectPartytownSnippet(window.location.pathname)
    collectedScriptsByPage.delete(window.location.pathname)
  }

export const onRouteUpdate: GatsbyBrowser[`onRouteUpdate`] = ({
  prevLocation,
  location,
}): void => {
  if (!prevLocation) {
    return
  }

  collectedScriptsByPage.delete(window.location.pathname)

  setTimeout(() => {
    injectPartytownSnippet(location.pathname)
  }, 0)
}
