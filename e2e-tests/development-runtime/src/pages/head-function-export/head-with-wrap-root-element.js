import * as React from "react"
import { data } from "../../../shared-data/head-function-export"
import { AppContext } from "../../app-context"

export default function HeadWithWrapRootElement() {
  return (
    <>
      <h1>
        I test that <code>wrapRootElement</code> + <code>Head</code> work
        correctly together
      </h1>
      <p>Just FYI, Here are few thing that get tested on this page </p>
      <ul>
        <li>Head can pickup nested head tags wrapped in UI elements</li>
        <li>Head can consume context from wrapRootElement</li>
      </ul>
    </>
  )
}

// wrapRootElement introduces further nesting on top of this, making it more deeply nested.
export function Head() {
  const { base, noscript, style, link, jsonLD } = data.static
  const contextValue = React.useContext(AppContext)

  return (
    <div>
      <base data-testid="base" href={base} />
      <title data-testid="title">{contextValue.posts[0].title}</title>
      <meta
        data-testid="meta"
        name="author"
        content={contextValue.posts[1].title}
      />
      <noscript data-testid="noscript">{noscript}</noscript>
      <style data-testid="style">
        {`
          h1 {
            color: ${style};
          }
        `}
      </style>
      <div>
        <link data-testid="link" href={link} rel="stylesheet" />
        <script data-testid="jsonLD" type="application/ld+json">
          {jsonLD}
        </script>
      </div>
    </div>
  )
}
