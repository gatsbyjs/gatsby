import * as React from "react"
import { Overlay, Header, Body, Footer, HeaderOpenClose } from "./overlay"
import { CodeFrame } from "./code-frame"
import { prettifyStack, openInEditor } from "../utils"

export function DevSsrError({ error }) {
  return (
    <Overlay>
      <Header data-gatsby-error-type="build-error">
        <div data-gatsby-overlay="header__cause-file">
          <h1 id="gatsby-overlay-labelledby">Dev SSR</h1>
          <span>filename</span>
        </div>
        <HeaderOpenClose open={() => openInEditor(`test`, 1)} dismiss={false} />
      </Header>
      <Body>
        <h2>Source</h2>
        <div>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
        <Footer id="gatsby-overlay-describedby">
          This error occurred during the build process and can only be dismissed
          by fixing the error.
        </Footer>
      </Body>
    </Overlay>
  )
}
