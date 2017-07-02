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

export default class HTML extends React.Component {
  render() {
    let css
    if (process.env.NODE_ENV === `production`) {
      css = (
        <style
          id="gatsby-inlined-css"
          key="gatsby-inlined-css"
          dangerouslySetInnerHTML={{ __html: stylesStr }}
        />
      )
    }

    return (
      <html lang="en">
        <head>
          <link
            rel="preload"
            href="/static/ftn45-webfont.c2439033.woff2"
            as="font"
            crossOrigin
          />
          <link
            rel="preload"
            href="/static/tex-gyre-schola-400.030fe0c4.woff2"
            as="font"
            crossOrigin
          />
          <link
            rel="preload"
            href="/static/ftn65-webfont.0ddc10d2.woff2"
            as="font"
            crossOrigin
          />
          {this.props.headComponents}
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="192x192"
            href={require(`file-loader!../static/images/favicons/android-icon-192x192.png`)}
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href={require(`file-loader!../static/images/favicons/favicon-32x32.png`)}
          />
          <link
            rel="icon"
            type="image/png"
            sizes="96x96"
            href={require(`file-loader!../static/images/favicons/favicon-96x96.png`)}
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href={require(`file-loader!../static/images/favicons/favicon-16x16.png`)}
          />
          <TypographyStyle key={`typography`} typography={typography} />
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
