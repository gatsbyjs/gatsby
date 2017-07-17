import React, { Component } from "react"
import { TypographyStyle } from "react-typography"
import logo from "!file-loader!../static/images/logo.png"
import * as PropTypes from "prop-types"
import typography from "./utils/typography"

let stylesStr
if (process.env.NODE_ENV === `production`) {
  try {
    stylesStr = require(`!raw-loader!../public/styles.css`)
  } catch (e) {
    console.log(e)
  }
}

const propTypes = {
  headComponents: PropTypes.node.isRequired,
  body: PropTypes.node.isRequired,
  postBodyComponents: PropTypes.node.isRequired,
}

class Html extends Component {
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
            href={`/static/space-mono-latin-700.eadcd2d5.woff2`}
            as="font"
            crossOrigin
          />
          <link
            rel="preload"
            href={`/static/space-mono-latin-400.a8338881.woff2`}
            as="font"
            crossOrigin
          />
          {this.props.headComponents}
          <meta charSet="utf-8" />
          <meta
            name="description"
            content="Gatsbygram: A clone of Instagram built with GatsbyJS"
          />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <link rel="icon" type="image/png" href={logo} />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Gatsbygram</title>
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

Html.propTypes = propTypes

module.exports = Html
