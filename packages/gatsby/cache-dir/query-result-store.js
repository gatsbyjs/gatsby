import React from "react"
import { StaticQueryContext } from "gatsby"
import {
  registerPath as socketRegisterPath,
  unregisterPath as socketUnregisterPath,
} from "./socketIo"
import PageRenderer from "./page-renderer"
import normalizePagePath from "./normalize-page-path"
import loader, { getStaticQueryResults, getSliceResults } from "./loader"
import { SlicesResultsContext } from "./slice/context"

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

export function PageQueryStore({location}) {
  const [pageData, setPageData] = React.useState(null);
  const [path, setPath] = React.useState(null);
  React.useEffect(() => {
    socketRegisterPath(getPathFromProps(props))
    ___emitter.on(`pageQueryResult`, handleMittEvent)
    ___emitter.on(`serverDataResult`, handleMittEvent)
    ___emitter.on(`onPostLoadPageResources`, handleMittEvent)

    window._gatsbyEvents.push([
      `FAST_REFRESH`,
      {
        action: `SHOW_GETSERVERDATA_ERROR`,
        payload: this.state?.page?.page?.getServerDataError,
      },
    ])
    
    return () => {
      socketUnregisterPath(path)
    ___emitter.off(`pageQueryResult`, handleMittEvent)
    ___emitter.off(`serverDataResult`, handleMittEvent)
    ___emitter.off(`onPostLoadPageResources`, handleMittEvent)
    };
  }, []);
  React.useEffect(() => {
    window._gatsbyEvents.push([
      `FAST_REFRESH`,
      {
        action: `SHOW_GETSERVERDATA_ERROR`,
        payload: this.state?.page?.page?.getServerDataError,
      },
    ])
  }, [location]);

  const handleMittEvent = () => {
    this.setState(state => {
      return {
        page: state.path
          ? loader.loadPageSync(normalizePagePath(state.path))
          : null,
      }
    })
  };

  function getDerivedStateFromProps(props, state) {
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

  function shouldComponentUpdate(nextProps, nextState) {
    // We want to update this component when:
    // - location changed
    // - page data for path changed

    return (
      location !== nextProps.location ||
      path !== nextState.path ||
      page !== nextState.page
    )
  }

  // eslint-disable-next-line
if (!this.state.page) {
return <div />
}

if (this.state.page.page.getServerDataError) {
return <div />
}

return <PageRenderer {...props} {...this.state.page.json} />;
}

export function StaticQueryStore({children}) {
  const [staticQueryData, setStaticQueryData] = React.useState({ ...getStaticQueryResults() });
  React.useEffect(() => {
    ___emitter.on(`staticQueryResult`, handleMittEvent)
    ___emitter.on(`onPostLoadPageResources`, handleMittEvent)
    
    return () => {
      ___emitter.off(`staticQueryResult`, handleMittEvent)
    ___emitter.off(`onPostLoadPageResources`, handleMittEvent)
    };
  }, []);

  const handleMittEvent = () => {
    setStaticQueryData({ ...getStaticQueryResults() })
  };

  function shouldComponentUpdate(nextProps, nextState) {
    // We want to update this component when:
    // - static query results changed

    return staticQueryData !== nextState.staticQueryData
  }

  return (
<StaticQueryContext.Provider value={staticQueryData}>
{children}
</StaticQueryContext.Provider>
);
}

export function SliceDataStore({children}) {
  const [slicesData, setSlicesData] = React.useState(new Map(getSliceResults()));
  React.useEffect(() => {
    ___emitter.on(`sliceQueryResult`, handleMittEvent)
    ___emitter.on(`onPostLoadPageResources`, handleMittEvent)
    
    return () => {
      ___emitter.off(`sliceQueryResult`, handleMittEvent)
    ___emitter.off(`onPostLoadPageResources`, handleMittEvent)
    };
  }, []);

  const handleMittEvent = () => {
    setSlicesData(new Map(getSliceResults()))
  };

  function shouldComponentUpdate(nextProps, nextState) {
    // We want to update this component when:
    // - slice results changed

    return slicesData !== nextState.slicesData
  }

  return (
<SlicesResultsContext.Provider value={slicesData}>
{children}
</SlicesResultsContext.Provider>
);
}
