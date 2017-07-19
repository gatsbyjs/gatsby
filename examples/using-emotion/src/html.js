import React from "react"
import PropTypes from "prop-types"

const Html = ({ headComponents, body, postBodyComponents }) =>
  <html lang="en">
    <head>
      <meta name="referrer" content="origin" />
      <meta charSet="utf-8" />
      <meta name="description" content="Gatsby example site using Emotion" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Gatsby Emotion</title>
      {headComponents}
    </head>
    <body>
      <div id="___gatsby" dangerouslySetInnerHTML={{ __html: body }} />
      {postBodyComponents}
    </body>
  </html>

Html.propTypes = {
  headComponents: PropTypes.node.isRequired,
  body: PropTypes.node.isRequired,
  postBodyComponents: PropTypes.node.isRequired,
}

export default Html
