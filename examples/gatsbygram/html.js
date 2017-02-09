import React from 'react'
import DocumentTitle from 'react-document-title'

//import { prefixLink } from 'gatsby-helpers'
import { GoogleFont, TypographyStyle } from 'react-typography'
import typography from './utils/typography'
import logo from '!file-loader!./images/logo.png'

let stylesStr
if (process.env.NODE_ENV === `production`) {
  try {
    stylesStr = require(`!raw-loader!./public/styles.css`)
  } catch (e) {
    console.log(e)
  }
}

module.exports = React.createClass({
  render () {
    const title = DocumentTitle.rewind()
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
          <link rel="preload" href={`/static/space-mono-latin-700.eadcd2d5.woff2`} as="font" crossOrigin />
          <link rel="preload" href={`/static/space-mono-latin-400.a8338881.woff2`} as="font" crossOrigin />
          <meta charSet="utf-8" />
          <meta name="description" content="GatsbyGram: A clone of Instagram built with GatsbyJS" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <link
            rel="icon"
            type="image/png"
            href={logo}
          />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>GatsbyGram</title>
          <TypographyStyle typography={typography} />
          {css}
          {this.props.headComponents}
        </head>
        <body>
          <div id="react-mount" dangerouslySetInnerHTML={{ __html: this.props.body }} />
          {this.props.postBodyComponents}
        </body>
      </html>
    )
  },
})
