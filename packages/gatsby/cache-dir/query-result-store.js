import React from "react"
import { StaticQueryContext } from "gatsby"
import {
  registerPath as socketRegisterPath,
  unregisterPath as socketUnregisterPath,
  getStaticQueryData as socketGetStaticQueryData,
} from "./socketIo"
import loader from "./loader"
import PageRenderer from "./page-renderer"
import normalizePagePath from "./normalize-page-path"

// Pulled from react-compat
// https://github.com/developit/preact-compat/blob/7c5de00e7c85e2ffd011bf3af02899b63f699d3a/src/index.js#L349
function shallowDiffers(a, b) {
  for (let i in a) if (!(i in b)) return true
  for (let i in b) if (a[i] !== b[i]) return true
  return false
}

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
    ? normalizePagePath(props.pageResources.page.path)
    : undefined

export class PageQueryStore extends React.Component {
  constructor(props) {
    super(props)
    console.log(`constructor PageQueryStore`)
    this.state = {
      pageQueryData: loader.getPageQueryData(),
      path: null,
    }
  }

  handleMittEvent = msg => {
    console.log(`handleMittEvent`, { msg })
    if (msg === `onPostLoadPageResources`) {
      this.setState({
        pageQueryData: loader.getPageQueryData(),
      })
    }
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

    const curProps = this.state.pageQueryData.get(this.state.path)?.payload
      ?.result
    const nextRealProps = nextState.pageQueryData.get(nextState.path)?.payload
      ?.result

    return (
      this.props.location !== nextProps.location ||
      this.state.path !== nextState.path ||
      shallowDiffers(curProps.pageContext, nextRealProps.pageContext) ||
      shallowDiffers(curProps.data, curProps.pageContext)
    )
  }

  render() {
    const data = this.state.pageQueryData.get(getPathFromProps(this.props))
      .payload
    console.log({ data })
    // eslint-disable-next-line
    if (!data) {
      return <div />
    }

    return <PageRenderer {...this.props} {...data.result} />
  }
}

export class StaticQueryStore extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      staticQueryData: {
        ...socketGetStaticQueryData(),
        ...loader.getStaticQueryResults(),
      },
    }
  }

  handleMittEvent = () => {
    this.setState({
      staticQueryData: {
        ...socketGetStaticQueryData(),
        ...loader.getStaticQueryResults(),
      },
    })
  }

  componentDidMount() {
    ___emitter.on(`*`, this.handleMittEvent)
  }

  componentWillUnmount() {
    ___emitter.off(`*`, this.handleMittEvent)
  }

  shouldComponentUpdate(nextProps, nextState) {
    // We want to update this component when:
    // - static query results changed

    return this.state.staticQueryData !== nextState.staticQueryData
  }

  render() {
    return (
      <StaticQueryContext.Provider value={this.state.staticQueryData}>
        {this.props.children}
      </StaticQueryContext.Provider>
    )
  }
}
