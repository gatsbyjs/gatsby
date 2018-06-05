import React, { Component } from "react"
import * as PropTypes from "prop-types"

class Html extends Component {
  render() {
    return (
      <html op="news" lang="en" {...this.props.htmlAttributes}>
        <head>
          <meta name="referrer" content="origin" />
          <meta charSet="utf-8" />
          <meta
            name="Gatsby example site showing use with redux"
            content="Gatsby example site showing use with redux"
          />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Gatsby - Redux</title>
          {this.props.headComponents}
        </head>
        <body {...this.props.bodyAttributes}>
          {this.props.preBodyComponents}
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

Html.propTypes = {
  htmlAttributes: PropTypes.object,
  headComponents: PropTypes.array,
  bodyAttributes: PropTypes.object,
  preBodyComponents: PropTypes.array,
  body: PropTypes.string,
  postBodyComponents: PropTypes.array,
}

export default Html
