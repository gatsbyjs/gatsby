import { parse, DocumentNode } from "graphql"

// TODO v4: mark all built-in types with @dontInfer and add missing fields (maybe as `JSON` type)

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
    pluginName: String!
    originalAbsoluteFilePath: String!
    originalRelativeFilePath: String!
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

const siteType = `
  type Site implements Node @infer {
    buildTime: Date @dateformat
    siteMetadata: SiteSiteMetadata
  }
`

const siteSiteMetadataType = `
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

const sitePluginType = `
  type SitePlugin implements Node @infer {
    resolve: String
    name: String
    version: String
    nodeAPIs: [String]
    browserAPIs: [String]
    ssrAPIs: [String]
    pluginFilepath: String
    # TODO v4:
    # pluginOptions: JSON
    # packageJson: JSON
  }
`

const siteBuildMetadataType = `
  type SiteBuildMetadata implements Node @infer {
    buildTime: Date @dateformat
  }
`

const allSdlTypes = [
  fileType,
  directoryType,
  siteType,
  siteSiteMetadataType,
  siteFunctionType,
  sitePageType,
  sitePluginType,
  siteBuildMetadataType,
]

export const overridableBuiltInTypeNames = new Set([`SiteSiteMetadata`])

export const builtInTypeDefinitions = (): Array<DocumentNode> =>
  allSdlTypes.map(type => parse(type))
