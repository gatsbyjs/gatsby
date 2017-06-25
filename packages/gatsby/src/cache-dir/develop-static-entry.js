import React from "react"
import { renderToString, renderToStaticMarkup } from "react-dom/server"
import { StaticRouter, Route, withRouter } from "react-router-dom"
import { kebabCase, get, merge, isArray, isString } from "lodash"
import apiRunner from "./api-runner-ssr"
import pages from "./pages.json"
import syncRequires from "./sync-requires"
import ReactDOMServer from "react-dom/server"

let HTML
try {
  HTML = require(`../src/html`)
} catch (e) {
  HTML = require(`./default-html`)
}

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
    bodyProps = _.merge({}, bodyProps, props)
  }

  apiRunner(`onRenderBody`, {
    setHeadComponents,
    setPreBodyComponents,
    setPostBodyComponents,
    setBodyProps,
  })

  const htmlElement = React.createElement(HTML, {
    ...bodyProps,
    body: ``,
    headComponents,
    preBodyComponents,
    postBodyComponents: postBodyComponents.concat([
      <script src="/commons.js" />,
    ]),
  })
  htmlStr = ReactDOMServer.renderToStaticMarkup(htmlElement)
  htmlStr = `<!DOCTYPE html>\n${htmlStr}`

  callback(null, htmlStr)
}
