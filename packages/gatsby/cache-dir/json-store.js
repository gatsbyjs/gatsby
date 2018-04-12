import React, { createElement } from "react"
import { Route } from "react-router-dom"
import ComponentRenderer from "./component-renderer"
import syncRequires from "./sync-requires"
import socketIo from "./socketIo"
import omit from "lodash/omit"
import get from "lodash/get"

const getPathFromProps = props => {
  if (props.isPage) {
    return get(props.pageResources, `page.path`)
  } else {
    return `/dev-404-page/`
  }
}

class JSONStore extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: {},
      path: null,
    }

    this.setPageData = this.setPageData.bind(this)

    this.socket = socketIo()
    this.socket.on(`queryResult`, this.setPageData)
  }

  componentWillMount() {
    this.registerPath(getPathFromProps(this.props))
  }

  componentWillReceiveProps(nextProps) {
    const { path } = this.state
    const newPath = getPathFromProps(nextProps)

    if (path !== newPath) {
      this.unregisterPath(path)
      this.registerPath(newPath)
    }
  }

  registerPath(path) {
    this.setState({ path })
    this.socket.emit(`registerPath`, path)
  }

  unregisterPath(path) {
    this.setState({ path: null })
    this.socket.emit(`unregisterPath`, path)
  }

  componentWillUnmount() {
    this.unregisterPath(this.state.path)
  }

  setPageData({ path, result }) {
    this.setState({
      data: {
        ...this.state.data,
        [path]: result,
      },
    })
  }

  render() {
    const { isPage, pages, pageResources } = this.props
    const data = this.state.data[this.state.path]
    const propsWithoutPages = omit(this.props, `pages`)

    if (!data) {
      return null
    } else if (isPage) {
      return createElement(ComponentRenderer, {
        key: `normal-page`,
        ...propsWithoutPages,
        ...data,
      })
    } else {
      const dev404Page = pages.find(p => /^\/dev-404-page/.test(p.path))
      return createElement(Route, {
        key: `404-page`,
        component: props =>
          createElement(
            syncRequires.components[dev404Page.componentChunkName],
            {
              ...propsWithoutPages,
              ...data,
            }
          ),
      })
    }
  }
}

export default JSONStore
