import React, { createElement } from "react"
import { Route } from "react-router-dom"
import omit from "lodash/omit"
import get from "lodash/get"

import ComponentRenderer from "./component-renderer"
import syncRequires from "./sync-requires"
import { StaticQueryContext } from "gatsby"
import socketIo, { getStaticQueryData, getPageQueryData } from "./socketIo"

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
      staticQueryData: getStaticQueryData(),
      pageQueryData: getPageQueryData(),
      path: null,
    }
    this.socket = socketIo()
  }

  handleMittEvent = (type, event) => {
    this.setState({
      staticQueryData: getStaticQueryData(),
      pageQueryData: getPageQueryData(),
    })
  }

  componentDidMount() {
    this.registerPath(getPathFromProps(this.props))
    ___emitter.on("*", this.handleMittEvent)
  }

  componentWillUnmount() {
    this.unregisterPath(this.state.path)
    ___emitter.off("*", this.handleMittEvent)
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

  render() {
    const { isPage, pages, pageResources } = this.props
    const data = this.state.pageQueryData[this.state.path]
    const propsWithoutPages = omit(this.props, `pages`)
    if (!data) {
      return <div />
    }

    if (isPage) {
      return (
        <StaticQueryContext.Provider value={this.state.staticQueryData}>
          <ComponentRenderer {...propsWithoutPages} {...data} />
        </StaticQueryContext.Provider>
      )
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
