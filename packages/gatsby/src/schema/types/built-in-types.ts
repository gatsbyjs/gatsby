import { parse, DocumentNode } from "graphql"

const fileType = `
  type File implements Node @infer {
    sourceInstanceName: String!
    absolutePath: String!
    relativePath: String!
    extension: String!
    size: Int!
    prettySize: String!
    modifiedTime: Date! @dateformat
    accessTime: Date! @dateformat
    changeTime: Date! @dateformat
    birthTime: Date! @dateformat
    root: String!
    dir: String!
    base: String!
    ext: String!
    name: String!
    relativeDirectory: String!
    dev: Int!
    mode: Int!
    nlink: Int!
    uid: Int!
    gid: Int!
    rdev: Int!
    ino: Float!
    atimeMs: Float!
    mtimeMs: Float!
    ctimeMs: Float!
    atime: Date! @dateformat
    mtime: Date! @dateformat
    ctime: Date! @dateformat
    birthtime: Date @deprecated(reason: "Use \`birthTime\` instead")
    birthtimeMs: Float @deprecated(reason: "Use \`birthTime\` instead")
  }
`

const siteFunctionType = `
  type SiteFunction implements Node @infer {
    functionRoute: String!
    originalFilePath: String!
    relativeCompiledFilePath: String!
    absoluteCompiledFilePath: String!
    matchPath: String
  }
`

const directoryType = `
  type Directory implements Node @infer {
    sourceInstanceName: String!
    absolutePath: String!
    relativePath: String!
    extension: String!
    size: Int!
    prettySize: String!
    modifiedTime: Date! @dateformat
    accessTime: Date! @dateformat
    changeTime: Date! @dateformat
    birthTime: Date! @dateformat
    root: String!
    dir: String!
    base: String!
    ext: String!
    name: String!
    relativeDirectory: String!
    dev: Int!
    mode: Int!
    nlink: Int!
    uid: Int!
    gid: Int!
    rdev: Int!
    ino: Float!
    atimeMs: Float!
    mtimeMs: Float!
    ctimeMs: Float!
    atime: Date! @dateformat
    mtime: Date! @dateformat
    ctime: Date! @dateformat
    birthtime: Date @deprecated(reason: "Use \`birthTime\` instead")
    birthtimeMs: Float @deprecated(reason: "Use \`birthTime\` instead")
  }
`

const site = `
  type Site implements Node @infer {
    buildTime: Date @dateformat
    siteMetadata: SiteSiteMetadata
  }
`

const siteSiteMetadata = `
  type SiteSiteMetadata {
    title: String
    description: String
  }
`

const sitePageType = `
  type SitePage implements Node @infer {
    path: String!
    component: String!
    internalComponentName: String!
    componentChunkName: String!
    matchPath: String
  }
`

const allSdlTypes = [
  fileType,
  directoryType,
  site,
  siteSiteMetadata,
  siteFunctionType,
  sitePageType,
]

export const overridableBuiltInTypeNames = new Set([`SiteSiteMetadata`])

export const builtInTypeDefinitions = (): Array<DocumentNode> =>
  allSdlTypes.map(type => parse(type))
