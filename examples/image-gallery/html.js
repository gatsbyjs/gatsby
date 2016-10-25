import React from 'react'
import DocumentTitle from 'react-document-title'

import { prefixLink } from 'gatsby-helpers'
import { GoogleFont, TypographyStyle } from 'react-typography'
import typography from './utils/typography'
import HTMLScripts from 'html-scripts'
import HTMLStyles from 'html-styles'

module.exports = React.createClass({
  render () {
    const title = DocumentTitle.rewind()

    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Image Gallery Gatsby Example Site</title>
          <TypographyStyle typography={typography} />
          <GoogleFont typography={typography} />
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
