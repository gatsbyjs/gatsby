import React from "react"

import PageRenderer from "./page-renderer"
import { StaticQueryContext } from "gatsby"
import {
  getStaticQueryData,
  getPageQueryData,
  registerPath as socketRegisterPath,
  unregisterPath as socketUnregisterPath,
} from "./socketIo"

if (process.env.NODE_ENV === `production`) {
  throw new Error(
    `It appears like Gatsby is misconfigured. JSONStore is Gatsby internal ` +
      `development-only component and should never be used in production.\n\n` +
      `Unless your site has a complex or custom webpack/Gatsby ` +
      `configuration this is likely a bug in Gatsby. ` +
      `Please report this at https://github.com/gatsbyjs/gatsby/issues ` +
      `with steps to reproduce this error.`
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
    console.log(`constructor`, this.state)
  }

  handleMittEvent = (type, event) => {
    console.log(`mitt`, type, event)
    this.setState({
      staticQueryData: getStaticQueryData(),
      pageQueryData: getPageQueryData(),
    })
    console.log(`after handle`, this.state)
  }

  componentDidMount() {
    socketRegisterPath(getPathFromProps(this.props))
    ___emitter.on(`*`, this.handleMittEvent)
  }

  componentWillUnmount() {
    socketUnregisterPath(this.state.path)
    ___emitter.off(`*`, this.handleMittEvent)
  }

  static getDerivedStateFromProps(props, state) {
    const newPath = getPathFromProps(props)
    console.log(`get derived`, props, newPath)
    if (newPath !== state.path) {
      socketUnregisterPath(state.path)
      socketRegisterPath(newPath)
      return {
        path: newPath,
      }
    }

    return null
  }

  shouldComponentUpdate(nextProps, nextState) {
    // We want to update this component when:
    // - location changed
    // - page data for path changed
    // - static query results changed

    console.log(`should`, this.state, nextState)
    console.log(
      `should update`,
      this.props.location !== nextProps.location ||
        this.state.path !== nextState.path ||
        this.state.pageQueryData[nextState.path] !==
          nextState.pageQueryData[nextState.path] ||
        this.state.staticQueryData !== nextState.staticQueryData
    )
    return (
      this.props.location !== nextProps.location ||
      this.state.path !== nextState.path ||
      this.state.pageQueryData[nextState.path] !==
        nextState.pageQueryData[nextState.path] ||
      this.state.staticQueryData !== nextState.staticQueryData
    )
  }

  render() {
    const data = this.state.pageQueryData[getPathFromProps(this.props)]
    console.log(`json store render`, this.props, data)
    // eslint-disable-next-line
    const { ...propsWithoutPages } = this.props
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
