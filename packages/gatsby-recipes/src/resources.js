import * as fileResource from "./providers/fs/file"
import * as directoryResource from "./providers/fs/directory"
import * as gatsbyPageResource from "./providers/gatsby/page"
import * as gatsbyPluginResource from "./providers/gatsby/plugin"
import * as gatsbyShadowFileResource from "./providers/gatsby/shadow-file"
import * as gatsbySiteMetadataResource from "./providers/gatsby/site-metadata"
import * as npmPackageResource from "./providers/npm/package"
import * as npmPackageScriptResource from "./providers/npm/script"
import * as npmPackageJsonResource from "./providers/npm/package-json"
import * as gitIgnoreResource from "./providers/git/ignore"
import * as contentfulSpace from "./providers/contentful/space"
import * as contentfulEnvironment from "./providers/contentful/environment"
import * as contentfulType from "./providers/contentful/type"
import * as contentfulEntry from "./providers/contentful/entry"

const componentResourceMapping = {
  File: fileResource,
  Directory: directoryResource,
  GatsbyPage: gatsbyPageResource,
  GatsbyPlugin: gatsbyPluginResource,
  GatsbyShadowFile: gatsbyShadowFileResource,
  GatsbySiteMetadata: gatsbySiteMetadataResource,
  NPMPackage: npmPackageResource,
  NPMScript: npmPackageScriptResource,
  NPMPackageJson: npmPackageJsonResource,
  GitIgnore: gitIgnoreResource,
  ContentfulSpace: contentfulSpace,
  ContentfulEnvironment: contentfulEnvironment,
  ContentfulType: contentfulType,
  ContentfulEntry: contentfulEntry,
}

export default componentResourceMapping
