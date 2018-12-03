module.exports = {
  'Production build tests': {
    'should remount when navigating to different template': {
      '1': [
        {
          action: `onPreRouteUpdate`,
          pathname: `/`,
          domContent: `index`,
        },
        {
          action: `constructor`,
          pageComponent: `component---src-pages-index-js`,
          locationPath: `/`,
          pagePath: `/`,
        },
        {
          action: `render`,
          pageComponent: `component---src-pages-index-js`,
          locationPath: `/`,
          pagePath: `/`,
        },
        {
          action: `componentDidMount`,
          pageComponent: `component---src-pages-index-js`,
          locationPath: `/`,
          pagePath: `/`,
        },
        {
          action: `onRouteUpdate`,
          pathname: `/`,
          domContent: `index`,
        },
        {
          action: `constructor`,
          pageComponent: `component---src-pages-page-2-js`,
          locationPath: `/page-2/`,
          pagePath: `/page-2/`,
        },
        {
          action: `render`,
          pageComponent: `component---src-pages-page-2-js`,
          locationPath: `/page-2/`,
          pagePath: `/page-2/`,
        },
        {
          action: `onPreRouteUpdate`,
          pathname: `/page-2/`,
          domContent: `index`,
        },
        {
          action: `componentWillUnmount`,
          pageComponent: `component---src-pages-index-js`,
          locationPath: `/`,
          pagePath: `/`,
        },
        {
          action: `componentDidMount`,
          pageComponent: `component---src-pages-page-2-js`,
          locationPath: `/page-2/`,
          pagePath: `/page-2/`,
        },
        {
          action: `onRouteUpdate`,
          pathname: `/page-2/`,
          domContent: `page-2`,
        },
      ],
    },
    'should remount when navigating to different page using same template': {
      '1': [
        {
          action: `onPreRouteUpdate`,
          pathname: `/`,
          domContent: `index`,
        },
        {
          action: `constructor`,
          pageComponent: `component---src-pages-index-js`,
          locationPath: `/`,
          pagePath: `/`,
        },
        {
          action: `render`,
          pageComponent: `component---src-pages-index-js`,
          locationPath: `/`,
          pagePath: `/`,
        },
        {
          action: `componentDidMount`,
          pageComponent: `component---src-pages-index-js`,
          locationPath: `/`,
          pagePath: `/`,
        },
        {
          action: `onRouteUpdate`,
          pathname: `/`,
          domContent: `index`,
        },
        {
          action: `constructor`,
          pageComponent: `component---src-pages-index-js`,
          locationPath: `/duplicated/`,
          pagePath: `/duplicated`,
        },
        {
          action: `render`,
          pageComponent: `component---src-pages-index-js`,
          locationPath: `/duplicated/`,
          pagePath: `/duplicated`,
        },
        {
          action: `onPreRouteUpdate`,
          pathname: `/duplicated/`,
          domContent: `index`,
        },
        {
          action: `componentWillUnmount`,
          pageComponent: `component---src-pages-index-js`,
          locationPath: `/`,
          pagePath: `/`,
        },
        {
          action: `componentDidMount`,
          pageComponent: `component---src-pages-index-js`,
          locationPath: `/duplicated/`,
          pagePath: `/duplicated`,
        },
        {
          action: `onRouteUpdate`,
          pathname: `/duplicated/`,
          domContent: `duplicated`,
        },
      ],
    },
    'should NOT remount when navigating within client only paths': {
      '1': [
        {
          action: `onPreRouteUpdate`,
          pathname: `/client-only-paths/`,
          domContent: `[client-only-path] index`,
        },
        {
          action: `constructor`,
          pageComponent: `component---src-pages-client-only-paths-js`,
          locationPath: `/client-only-paths/`,
          pagePath: `/client-only-paths/`,
        },
        {
          action: `render`,
          pageComponent: `component---src-pages-client-only-paths-js`,
          locationPath: `/client-only-paths/`,
          pagePath: `/client-only-paths/`,
        },
        {
          action: `componentDidMount`,
          pageComponent: `component---src-pages-client-only-paths-js`,
          locationPath: `/client-only-paths/`,
          pagePath: `/client-only-paths/`,
        },
        {
          action: `onRouteUpdate`,
          pathname: `/client-only-paths/`,
          domContent: `[client-only-path] index`,
        },
        {
          action: `render`,
          pageComponent: `component---src-pages-client-only-paths-js`,
          locationPath: `/client-only-paths/profile`,
          pagePath: `/client-only-paths/`,
        },
        {
          action: `onPreRouteUpdate`,
          pathname: `/client-only-paths/profile`,
          domContent: `[client-only-path] index`,
        },
        {
          action: `onRouteUpdate`,
          pathname: `/client-only-paths/profile`,
          domContent: `[client-only-path] profile`,
        },
        {
          action: `render`,
          pageComponent: `component---src-pages-client-only-paths-js`,
          locationPath: `/client-only-paths/dashboard`,
          pagePath: `/client-only-paths/`,
        },
        {
          action: `onPreRouteUpdate`,
          pathname: `/client-only-paths/dashboard`,
          domContent: `[client-only-path] profile`,
        },
        {
          action: `onRouteUpdate`,
          pathname: `/client-only-paths/dashboard`,
          domContent: `[client-only-path] dashboard`,
        },
      ],
    },
  },
  __version: `3.1.2`,
}
