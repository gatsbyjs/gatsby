import React from 'react'
import DocumentTitle from 'react-document-title'

//import { prefixLink } from 'gatsby-helpers'
import { GoogleFont, TypographyStyle } from 'react-typography'
import typography from './utils/typography'
import HTMLStyles from '.intermediate-representation/html-styles'

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
          <title>GatsbyGram</title>
          <TypographyStyle typography={typography} />
          <HTMLStyles />
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
