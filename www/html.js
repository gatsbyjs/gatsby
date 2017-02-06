import React from 'react'

import { prefixLink } from 'gatsby-helpers'
import { TypographyStyle } from 'react-typography'
import typography from './utils/typography'
import InlineCSS from 'gatsby-inline-css'

module.exports = React.createClass({
  render () {
    return (
      <html lang="en">
        <head>
          {this.props.headComponents}
          <title>Gatsby</title>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <link rel="icon" type="image/png" sizes="192x192" href={require("images/favicons/android-icon-192x192.png")} />
          <link rel="icon" type="image/png" sizes="32x32" href={require("images/favicons/favicon-32x32.png")} />
          <link rel="icon" type="image/png" sizes="96x96" href={require("images/favicons/favicon-96x96.png")} />
          <link rel="icon" type="image/png" sizes="16x16" href={require("images/favicons/favicon-16x16.png")} />
          <TypographyStyle typography={typography} />
          <InlineCSS />
        </head>
        <body>
          <div id="react-mount" dangerouslySetInnerHTML={{ __html: this.props.body }} />
          {this.props.postBodyComponents}
        </body>
      </html>
    )
  },
})
