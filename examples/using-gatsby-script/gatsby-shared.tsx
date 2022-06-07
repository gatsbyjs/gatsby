import React from "react"
import { Script } from "gatsby"
import type { GatsbyBrowser, GatsbySSR } from "gatsby"

/**
 * Shared `wrapPageElement` and `wrapRootElement` functions to be
 * re-exported in gatsby-browser and gatsby-ssr.
 */

export const wrapPageElement:
  | GatsbyBrowser[`wrapPageElement`]
  | GatsbySSR[`wrapPageElement`] = ({ element }): JSX.Element => (
  <>
    {element}
    <Script>{`console.log('success loading script in wrapPageElement')`}</Script>
  </>
)

export const wrapRootElement:
  | GatsbyBrowser[`wrapRootElement`]
  | GatsbySSR[`wrapRootElement`] = ({ element }): JSX.Element => (
  <>
    {element}
    <Script>{`console.log('success loading script in wrapRootElement')`}</Script>
  </>
)
