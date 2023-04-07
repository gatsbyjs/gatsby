import { filterHeadProps } from "../../head/utils"

const fullPropsExample = {
  path: `/john/`,
  location: {
    pathname: `/john/`,
    search: ``,
    hash: ``,
    href: `http://localhost:8000/john/`,
    origin: `http://localhost:8000`,
    protocol: `http:`,
    host: `localhost:8000`,
    hostname: `localhost`,
    port: `8000`,
    state: {
      key: `1656493073882`,
    },
    key: `1656493073882`,
  },
  pageResources: {
    component: {},
    json: {
      pageContext: {
        id: `502c6522-6bf1-57de-ad0a-a1a0899d46b8`,
        name: `John`,
        __params: {
          name: `john`,
        },
      },
      serverData: {
        hello: `world`,
      },
    },
    page: {
      componentChunkName: `component---src-pages-person-name-tsx`,
      path: `/john/`,
      webpackCompilationHash: `123`,
      staticQueryHashes: [],
    },
    staticQueryResults: {},
  },
  data: {
    site: {
      siteMetadata: {
        title: `gatsby-head`,
      },
    },
  },
  uri: `/john`,
  children: null,
  pageContext: {
    id: `502c6522-6bf1-57de-ad0a-a1a0899d46b8`,
    name: `John`,
    __params: {
      name: `john`,
    },
  },
  serverData: {
    hello: `world`,
  },
  params: {
    name: `john`,
  },
}

const minimalExample = {
  path: `/john/`,
  location: {
    pathname: `/john/`,
    search: ``,
    hash: ``,
    href: `http://localhost:8000/john/`,
    origin: `http://localhost:8000`,
    protocol: `http:`,
    host: `localhost:8000`,
    hostname: `localhost`,
    port: `8000`,
    state: {
      key: `1656493073882`,
    },
    key: `1656493073882`,
  },
  pageResources: {
    component: {},
    json: {
      pageContext: {
        id: `502c6522-6bf1-57de-ad0a-a1a0899d46b8`,
        name: `John`,
        __params: {
          name: `john`,
        },
      },
      serverData: null,
    },
    page: {
      componentChunkName: `component---src-pages-person-name-tsx`,
      path: `/john/`,
      webpackCompilationHash: `123`,
      staticQueryHashes: [],
    },
    staticQueryResults: {},
  },
  uri: `/john`,
  children: null,
  pageContext: {},
  serverData: null,
  params: {},
}

describe(`head utils`, () => {
  describe(`filterHeadProps`, () => {
    it(`should return the correct valid props for full example`, () => {
      const props = filterHeadProps(fullPropsExample)
      expect(props).toStrictEqual({
        location: {
          pathname: `/john/`,
        },
        params: {
          name: `john`,
        },
        serverData: {
          hello: `world`,
        },
        data: {
          site: {
            siteMetadata: {
              title: `gatsby-head`,
            },
          },
        },
        pageContext: {
          id: `502c6522-6bf1-57de-ad0a-a1a0899d46b8`,
          name: `John`,
          __params: {
            name: `john`,
          },
        },
      })
    })
    it(`should return the correct valid props for minimal example`, () => {
      const props = filterHeadProps(minimalExample)
      expect(props).toStrictEqual({
        location: {
          pathname: `/john/`,
        },
        params: {},
        serverData: null,
        data: {},
        pageContext: {},
      })
    })
  })
})
