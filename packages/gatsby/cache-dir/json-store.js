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
    }
    try {
      this.socket = window.io()
    } catch (err) {
      console.error(`Could not connect to socket.io on dev server.`)
    }
    this.setPageData = this.setPageData.bind(this)
    this.getPageData = this.getPageData.bind(this)
  }

  componentDidMount() {
    this.socket.on(`queryResult`, this.setPageData)
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps !== this.props) return true

    // if json for nextState is not available
    const nextJsonId = get(nextProps.pageResources, `page.jsonName`)
    if (!nextState.data[nextJsonId]) return false

    // if nextState json is the same as current state json
    const sameDataPath =
      get(nextState, `data[${nextJsonId}].dataPath`) ===
      get(this, `state.data[${nextJsonId}].dataPath`)

    if (sameDataPath) return false

    return true
  }

  setPageData(newData) {
    this.setState({
      data: { [newData.path]: newData },
    })
  }

  getPageData(path) {
    const res = this.state.data[path]

    // always check for fresh data
    this.socket.emit(`getPageData`, path)

    if (!res || !res.data) return false
    return JSON.parse(res.data)
  }

  render() {
    const { isPage, pages, pageResources } = this.props
    const propsWithoutPages = omit(this.props, `pages`)

    if (isPage) {
      const jsonId = get(pageResources, `page.jsonName`)
      const pageData = this.getPageData(jsonId)
      if (pageData === false) return ``
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
