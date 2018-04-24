import React, { createElement } from "react"
import { Route } from "react-router-dom"
import omit from "lodash/omit"
import get from "lodash/get"

import PageRenderer from "./page-renderer"
import syncRequires from "./sync-requires"
import { StaticQueryContext } from "gatsby"
import socketIo, { getStaticQueryData, getPageQueryData } from "./socketIo"

const getPathFromProps = props => get(props.pageResources, `page.path`)

class JSONStore extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      staticQueryData: getStaticQueryData(),
      pageQueryData: getPageQueryData(),
      path: null,
    }
    if (process.env.NODE_ENV !== `production`) {
      this.socket = socketIo()
    }
  }

  handleMittEvent = (type, event) => {
    if (process.env.NODE_ENV !== `production`) {
      this.setState({
        staticQueryData: getStaticQueryData(),
        pageQueryData: getPageQueryData(),
      })
    }
  }

  componentDidMount() {
    if (process.env.NODE_ENV !== `production`) {
      this.registerPath(getPathFromProps(this.props))
      ___emitter.on(`*`, this.handleMittEvent)
    }
  }

  componentWillUnmount() {
    if (process.env.NODE_ENV !== `production`) {
      this.unregisterPath(this.state.path)
      ___emitter.off(`*`, this.handleMittEvent)
    }
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
    if (process.env.NODE_ENV !== `production`) {
      this.setState({ path })
      this.socket.emit(`registerPath`, path)
    }
  }

  unregisterPath(path) {
    if (process.env.NODE_ENV !== `production`) {
      this.setState({ path: null })
      this.socket.emit(`unregisterPath`, path)
    }
  }

  render() {
    const { pages, pageResources } = this.props
    const data = this.state.pageQueryData[this.state.path]
    const propsWithoutPages = omit(this.props, `pages`)
    if (!data) {
      return <div />
    }

    return (
      <StaticQueryContext.Provider value={this.state.staticQueryData}>
        <PageRenderer {...propsWithoutPages} {...data} />
      </StaticQueryContext.Provider>
    )
  }
}

export default JSONStore
