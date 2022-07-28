import React from "react"
import {
  registerPath as socketRegisterPath,
  unregisterPath as socketUnregisterPath,
} from "./socketIo"
import PageRenderer from "./page-renderer"
import normalizePagePath from "./normalize-page-path"
import loader, { getStaticQueryResults } from "./loader"
import { staticQuerySingleton } from "./static-query"

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
    this.state = {
      pageData: null,
      path: null,
    }
  }

  handleMittEvent = () => {
    this.setState(state => {
      return {
        page: state.path
          ? loader.loadPageSync(normalizePagePath(state.path))
          : null,
      }
    })
  }

  componentDidMount() {
    socketRegisterPath(getPathFromProps(this.props))
    ___emitter.on(`pageQueryResult`, this.handleMittEvent)
    ___emitter.on(`serverDataResult`, this.handleMittEvent)
    ___emitter.on(`onPostLoadPageResources`, this.handleMittEvent)

    window._gatsbyEvents.push([
      `FAST_REFRESH`,
      {
        action: `SHOW_GETSERVERDATA_ERROR`,
        payload: this.state?.page?.page?.getServerDataError,
      },
    ])
  }

  componentDidUpdate() {
    window._gatsbyEvents.push([
      `FAST_REFRESH`,
      {
        action: `SHOW_GETSERVERDATA_ERROR`,
        payload: this.state?.page?.page?.getServerDataError,
      },
    ])
  }

  componentWillUnmount() {
    socketUnregisterPath(this.state.path)
    ___emitter.off(`pageQueryResult`, this.handleMittEvent)
    ___emitter.off(`serverDataResult`, this.handleMittEvent)
    ___emitter.off(`onPostLoadPageResources`, this.handleMittEvent)
  }

  static getDerivedStateFromProps(props, state) {
    const newPath = getPathFromProps(props)
    if (newPath !== state.path) {
      socketUnregisterPath(state.path)
      socketRegisterPath(newPath)
      return {
        path: newPath,
        page: newPath ? loader.loadPageSync(normalizePagePath(newPath)) : null,
      }
    }

    return null
  }

  shouldComponentUpdate(nextProps, nextState) {
    // We want to update this component when:
    // - location changed
    // - page data for path changed

    return (
      this.props.location !== nextProps.location ||
      this.state.path !== nextState.path ||
      this.state.page !== nextState.page
    )
  }

  render() {
    // eslint-disable-next-line
    if (!this.state.page) {
      return <div />
    }

    if (this.state.page.page.getServerDataError) {
      return <div />
    }

    return <PageRenderer {...this.props} {...this.state.page.json} />
  }
}

export const StaticQueryStore = ({ children }) => {
  const [staticQueryUpdateDate, setstaticQueryUpdateDate] = React.useState(
    Date.now()
  )

  const handleMittEvent = () => {
    staticQuerySingleton.set(getStaticQueryResults())
    setstaticQueryUpdateDate(Date.now())
  }

  const handleEvent = React.useCallback(handleMittEvent, [])

  React.useEffect(() => {
    ___emitter.on(`staticQueryResult`, handleMittEvent)
    ___emitter.on(`onPostLoadPageResources`, handleMittEvent)

    return () => {
      ___emitter.off(`staticQueryResult`, handleMittEvent)
      ___emitter.off(`onPostLoadPageResources`, handleMittEvent)
    }
  }, [handleEvent])

  staticQuerySingleton.set(getStaticQueryResults())

  // React.Children.toArray doesn't traverse into fragments (see https://github.com/facebook/react/issues/6889)
  // But this is fine since we only care about the next level of nesting anyways
  return React.Children.toArray(children).map(child =>
    React.cloneElement(child, { key: staticQueryUpdateDate })
  )
}
