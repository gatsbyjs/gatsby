import { IGatsbyState } from "../../../../internal"

const pages: IGatsbyState["pages"] = new Map()

pages.set(`/`, {
  internalComponentName: 'ComponentIndex',
  path: '/',
  matchPath: undefined,
  component: '/x/src/pages/index.tsx',
  componentPath: '/x/src/pages/index.tsx',
  componentChunkName: 'component---src-pages-index-tsx',
  isCreatedByStatefulCreatePages: true,
  context: {},
  updatedAt: 1,
  slices: {},
  pluginCreator___NODE: '',
  pluginCreatorId: '',
  mode: 'SSG',
  ownerNodeId: ``
})

pages.set(`/dsg`, {
  internalComponentName: 'Component/dsg',
  path: '/dsg',
  matchPath: undefined,
  component: '/x/src/pages/dsg.tsx',
  componentPath: '/x/src/pages/dsg.tsx',
  componentChunkName: 'component---src-pages-dsg-tsx',
  isCreatedByStatefulCreatePages: true,
  context: {},
  updatedAt: 1,
  slices: {},
  pluginCreator___NODE: '',
  pluginCreatorId: '',
  mode: 'DSG',
  ownerNodeId: ``,
  defer: true,
})

pages.set(`/ssr`, {
  internalComponentName: 'Component/ssr',
  path: '/ssr',
  matchPath: undefined,
  component: '/x/src/pages/ssr.tsx',
  componentPath: '/x/src/pages/ssr.tsx',
  componentChunkName: 'component---src-pages-ssr-tsx',
  isCreatedByStatefulCreatePages: true,
  context: {},
  updatedAt: 1,
  slices: {},
  pluginCreator___NODE: '',
  pluginCreatorId: '',
  mode: 'SSR',
  ownerNodeId: ``
})

const staticQueryComponents: IGatsbyState["staticQueryComponents"] = new Map()

staticQueryComponents.set(`sq--src-pages-index-tsx`, {
  name: 'TitleQuery',
  componentPath: '/x/src/pages/index.tsx',
  id: 'sq--src-pages-index-tsx',
  query: 'query BioQuery {\n  site {\n    siteMetadata {\n      title\n    }\n  }\n}',
  hash: '1'
})

const redirects: IGatsbyState["redirects"] = [{
  fromPath: '/old-url',
  isPermanent: true,
  ignoreCase: true,
  redirectInBrowser: false,
  toPath: '/new-url'
}, {
  fromPath: '/old-url2',
  isPermanent: true,
  ignoreCase: true,
  redirectInBrowser: false,
  toPath: '/new-url2',
  force: true,
  conditions: { language: [`ca`, `us`] }
}, {
  fromPath: 'https://old-url',
  isPermanent: true,
  ignoreCase: true,
  redirectInBrowser: false,
  toPath: 'https://new-url'
}, {
  fromPath: 'http://old-url',
  isPermanent: true,
  ignoreCase: true,
  redirectInBrowser: false,
  toPath: 'http://new-url'
}]

const functions: IGatsbyState["functions"] = [{
  functionRoute: 'static',
  pluginName: 'default-site-plugin',
  originalAbsoluteFilePath: '/x/src/api/static/index.js',
  originalRelativeFilePath: 'static/index.js',
  relativeCompiledFilePath: 'static/index.js',
  absoluteCompiledFilePath: '/x/.cache/functions/static/index.js',
  matchPath: undefined,
  functionId: 'static-index-js'
}]

const components: IGatsbyState["components"] = new Map()

components.set('/x/src/pages/dsg.tsx', {
  componentPath: '/x/src/pages/dsg.tsx',
  componentChunkName: 'component---src-pages-dsg-tsx',
  query: '',
  pages: new Set([``]),
  isInBootstrap: true,
  serverData: false,
  config: false,
  isSlice: false,
  Head: true
})

components.set('/x/src/pages/index.tsx', {
  componentPath: '/x/src/pages/index.tsx',
  componentChunkName: 'component---src-pages-index-tsx',
  query: '',
  pages: new Set([``]),
  isInBootstrap: true,
  serverData: false,
  config: false,
  isSlice: false,
  Head: true
})

components.set('/x/src/pages/ssr.tsx', {
  componentPath: '/x/src/pages/ssr.tsx',
  componentChunkName: 'component---src-pages-ssr-tsx',
  query: '',
  pages: new Set([``]),
  isInBootstrap: true,
  serverData: true,
  config: false,
  isSlice: false,
  Head: false
})

const slices: IGatsbyState["slices"] = new Map()

const html: IGatsbyState["html"] = {
  trackedHtmlFiles: new Map(),
  browserCompilationHash: ``,
  ssrCompilationHash: ``,
  trackedStaticQueryResults: new Map(),
  unsafeBuiltinWasUsedInSSR: false,
  templateCompilationHashes: {},
  slicesProps: {
    bySliceId: new Map(),
    byPagePath: new Map(),
    bySliceName: new Map(),
  },
  pagesThatNeedToStitchSlices: new Set()
}

export const state = {
  pages,
  staticQueryComponents,
  redirects,
  functions,
  config: {
    headers: [],
  },
  slices,
  html,
  components,
  program: {}
} as unknown as IGatsbyState
