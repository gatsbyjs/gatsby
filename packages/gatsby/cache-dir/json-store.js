import React from "react"

import PageRenderer from "./page-renderer"
import { StaticQueryContext } from "gatsby"
import socketIo, { getStaticQueryData, getPageQueryData } from "./socketIo"

if (process.env.NODE_ENV === `production`) {
  throw new Error(
    `It appears like Gatsby is misconfigured. JSONStore shouldn't be used in production.`
  )
}

const getPathFromProps = props =>
  props.pageResources && props.pageResources.page
    ? props.pageResources.page.path
    : undefined

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
    ___emitter.on(`*`, this.handleMittEvent)
  }

  componentWillUnmount() {
    this.unregisterPath(this.state.path)
    ___emitter.off(`*`, this.handleMittEvent)
  }

  componentDidUpdate() {
    const { path } = this.state
    const newPath = getPathFromProps(this.props)
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
    const data = this.state.pageQueryData[getPathFromProps(this.props)]
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
