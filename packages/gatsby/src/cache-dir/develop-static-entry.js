import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { merge } from "lodash"
import apiRunner from "./api-runner-ssr"

let Html
try {
  Html = require(`../src/html`)
} catch (e) {
  Html = require(`./default-html`)
}

Html = Html && Html.__esModule ? Html.default : Html

module.exports = (locals, callback) => {
  // const apiRunner = require(`${directory}/.cache/api-runner-ssr`)
  let headComponents = []
  let preBodyComponents = []
  let postBodyComponents = []
  let bodyProps = {}
  let htmlStr

  const setHeadComponents = components => {
    headComponents = headComponents.concat(components)
  }

  const setPreBodyComponents = components => {
    preBodyComponents = preBodyComponents.concat(components)
  }

  const setPostBodyComponents = components => {
    postBodyComponents = postBodyComponents.concat(components)
  }

  const setBodyProps = props => {
    bodyProps = merge({}, bodyProps, props)
  }

  apiRunner(`onRenderBody`, {
    setHeadComponents,
    setPreBodyComponents,
    setPostBodyComponents,
    setBodyProps,
  })

  const htmlElement = React.createElement(Html, {
    ...bodyProps,
    body: ``,
    headComponents: headComponents.concat([
      <script key={`io`} src="/socket.io/socket.io.js" />,
    ]),
    preBodyComponents,
    postBodyComponents: postBodyComponents.concat([
      <script key={`commons`} src="/commons.js" />,
    ]),
  })
  htmlStr = renderToStaticMarkup(htmlElement)
  htmlStr = `<!DOCTYPE html>\n${htmlStr}`

  callback(null, htmlStr)
}
