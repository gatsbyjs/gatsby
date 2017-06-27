import React from "react"
import { TypographyStyle } from "react-typography"

import typography from "./utils/typography"

let stylesStr
if (process.env.NODE_ENV === `production`) {
  try {
    stylesStr = require(`!raw-loader!../public/styles.css`)
  } catch (e) {
    console.log(e)
  }
}

class HTML extends React.Component {
  render() {
    let css
    if (process.env.NODE_ENV === `production`) {
      css = (
        <style
          id="gatsby-inlined-css"
          dangerouslySetInnerHTML={{ __html: stylesStr }}
        />
      )
    }

    return (
      <html lang="en">
        <head>
          <link
            rel="preload"
            href={`/static/spectral-latin-400.bc2de9de.woff2`}
            as="font"
            crossOrigin
          />
          <link
            rel="preload"
            href={`/static/spectral-latin-800.53eca5bf.woff2`}
            as="font"
            crossOrigin
          />
          <link
            rel="prefetch"
            href={`/static/spectral-latin-400italic.b0c97eb5.woff2`}
          />
          <link
            rel="prefetch"
            href={`/static/spectral-latin-700.601f0e2d.woff2`}
          />
          <link
            rel="prefetch"
            href={`/static/spectral-latin-700italic.64a7de98.woff2`}
          />
          <link
            rel="prefetch"
            href={`/static/space-mono-latin-400.a8338881.woff2`}
          />
          <link
            rel="prefetch"
            href={`/static/space-mono-latin-700.eadcd2d5.woff2`}
          />
          {this.props.headComponents}
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <TypographyStyle typography={typography} />
          {css}
        </head>
        <body>
          <div
            id="___gatsby"
            dangerouslySetInnerHTML={{ __html: this.props.body }}
          />
          {this.props.postBodyComponents}
        </body>
      </html>
    )
  }
}

export default HTML
