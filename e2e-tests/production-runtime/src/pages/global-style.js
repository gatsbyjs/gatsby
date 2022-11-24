import * as React from "react"

import Layout from "../components/layout"
import Seo from "../components/seo"

const GlobalStyle = () => (
  <Layout>
    <h1 data-testid="global-plugin-style">
      This text should have a large z-index (via `gatsby-plugin-global-style`)
    </h1>
    <h2 data-testid="global-style">
      This text should have a large z-index (via root-level `gatsby-browser.js`)
    </h2>

    <div data-testid="global-style-background" className="dog-background"></div>
    <div data-testid="global-style-custom-font" className="merriweather">
      I'm a custom font
    </div>
    <div
      data-testid="global-style-fullurl"
      className="dog-background-dither"
    ></div>
    <div
      data-testid="global-style-urlwithoutprotocol"
      className="dog-background-flip"
    ></div>
  </Layout>
)

export const Head = () => <Seo />
export default GlobalStyle
