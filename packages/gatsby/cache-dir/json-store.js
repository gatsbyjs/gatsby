import React, { createElement } from "react"
import { Route } from "react-router-dom"
import ComponentRenderer from "./component-renderer"
import syncRequires from "./sync-requires"
import omit from "lodash/omit"
import get from "lodash/get"

class JSONStore extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: {},
      receivedData: false,
    }
    try {
      this.socket = window.io()
    } catch (err) {
      console.error(`Could not connect to socket.io on dev server.`)
    }
  }

  componentDidMount() {
    this.socket.on(`queryResult`, data => {
      this.setState({
        data,
        receivedData: true,
      })
    })
  }

  getPageData(path) {
    const ob = this.state.data[path]
    if (!ob) {
      console.log(`Missing JSON: ${path}`)
      return {}
    }
    return JSON.parse(ob)
  }

  render() {
    if (!this.state.receivedData) return ``
    const { isPage, pages, pageResources } = this.props
    const propsWithoutPages = omit(this.props, `pages`)
    if (isPage) {
      const jsonId = get(pageResources, `page.jsonName`)
      const pageData = this.getPageData(jsonId)
      return createElement(ComponentRenderer, {
        key: `normal-page`,
        ...propsWithoutPages,
        ...pageData,
      })
    } else {
      const dev404Page = pages.find(p => /^\/dev-404-page/.test(p.path))
      const dev404Props = {
        ...propsWithoutPages,
        ...this.getPageData(dev404Page.jsonName),
      }
      return createElement(Route, {
        key: `404-page`,
        component: props =>
          createElement(
            syncRequires.components[dev404Page.componentChunkName],
            dev404Props
          ),
      })
    }
  }
}

export default JSONStore
