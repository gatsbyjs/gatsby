import React from "react"

import PageRenderer from "./page-renderer"
import { StaticQueryContext } from "gatsby"
import socketIo, { getStaticQueryData, getPageQueryData } from "./socketIo"

const getPathFromProps = props =>
  props.pageResources
    ? props.pageResources.page
      ? props.pageResources.page.path
      : undefined
    : undefined

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
    const data = this.state.pageQueryData[this.state.path]
    // eslint-disable-next-line
    const { pages, ...propsWithoutPages } = this.props
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
