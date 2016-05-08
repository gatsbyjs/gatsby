import React, { PropTypes } from 'react'
import { prefixLink } from 'gatsby-helpers'

function HTML (props) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0 maximum-scale=5.0"
        />
      </head>
      <body>
        <div id="react-mount" dangerouslySetInnerHTML={{ __html: props.body }} />
        <footer>GatsbyJS Override html.js</footer>
        <script src={prefixLink('/bundle.js')} />
      </body>
    </html>
  )
}

HTML.propTypes = { body: PropTypes.any }

module.exports = HTML
