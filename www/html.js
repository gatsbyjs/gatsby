import React from 'react'

import { prefixLink } from 'gatsby-helpers'
import { GoogleFont, TypographyStyle } from 'react-typography'
import typography from './utils/typography'
import HTMLScripts from 'html-scripts'
import HTMLStyles from 'html-styles'

module.exports = React.createClass({
  render () {
    return (
      <html lang="en">
        <head>
          <title>Gatsby</title>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <GoogleFont typography={typography} />
          <TypographyStyle typography={typography} />
          <HTMLStyles />
          {this.props.headComponents}
        </head>
        <body>
          <div id="react-mount" dangerouslySetInnerHTML={{ __html: this.props.body }} />
          <HTMLScripts scripts={this.props.scripts} />
        </body>
      </html>
    )
  },
})
