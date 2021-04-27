import * as React from "react"
import { Overlay, Header, Body, Footer, HeaderOpenClose } from "./overlay"
import { CodeFrame } from "./code-frame"
import { prettifyStack, openInEditor, skipSSR } from "../utils"

export function DevSsrError({ error }) {
  const { codeFrame, source, line } = error
  const decoded = prettifyStack(codeFrame)

  return (
    <Overlay>
      <Header data-gatsby-error-type="build-error">
        <div data-gatsby-overlay="header__cause-file">
          <h1 id="gatsby-overlay-labelledby">Failed to server render (SSR)</h1>
          <span>{source}</span>
        </div>
        <HeaderOpenClose
          open={() => openInEditor(source, line)}
          dismiss={false}
        />
      </Header>
      <Body>
        <p
          id="gatsby-overlay-describedby"
          data-gatsby-overlay="body__describedby"
        >
          React Components in Gatsby must render both successfully in the
          browser and in a Node.js environment. When we tried to render your
          page component in Node.js, it errored.
        </p>
        <h2>Source</h2>
        <CodeFrame decoded={decoded} />
        <div data-gatsby-overlay="codeframe__bottom">
          See our docs page for more info on SSR errors:{` `}
          <a href="https://www.gatsbyjs.com/docs/debugging-html-builds/">
            https://www.gatsbyjs.com/docs/debugging-html-builds/
          </a>
        </div>
        <h2 style={{ marginTop: `var(--space)` }}>Skip SSR</h2>
        <p>
          If you don't wish to fix the SSR error at the moment, press the button
          to reload the page without attempting to do SSR.
        </p>
        <button onClick={() => skipSSR()} data-gatsby-overlay="primary-button">
          Skip SSR
        </button>
        <Footer>
          <span data-font-weight="bold">Note:</span> This error will show up
          during "gatsby build" so it must be fixed before then. SSR errors in
          module scope, e.g. outside of your own React components can't be
          skipped.
        </Footer>
      </Body>
    </Overlay>
  )
}
