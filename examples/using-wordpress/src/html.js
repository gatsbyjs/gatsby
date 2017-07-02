import React, { Component } from 'react'
import * as PropTypes from 'prop-types'
import Helmet from 'react-helmet'

let stylesStr
if (process.env.NODE_ENV === `production`) {
  try {
    stylesStr = require(`!raw-loader!../public/styles.css`)
  } catch (e) {
    console.log(e)
  }
}

class Html extends Component {
  render() {
    const head = Helmet.rewind() // TODO
    let css
    if (process.env.NODE_ENV === `production`) {
      css = (
        <style id="gatsby-inlined-css" dangerouslySetInnerHTML={{ __html: stylesStr }} />
      )
    }

    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="referrer" content="origin" />
          <meta name="description" content="BCGDV" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          {this.props.headComponents}
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

Html.propTypes = {
  headComponents: PropTypes.node.isRequired,
  body: PropTypes.node.isRequired,
  postBodyComponents: PropTypes.node.isRequired,
}

module.exports = Html
