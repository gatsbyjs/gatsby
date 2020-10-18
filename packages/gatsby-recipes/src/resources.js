const fileResource = require(`./providers/fs/file`)
const directoryResource = require(`./providers/fs/directory`)
const gatsbyPageResource = require(`./providers/gatsby/page`)
const gatsbyPluginResource = require(`./providers/gatsby/plugin`)
const gatsbyShadowFileResource = require(`./providers/gatsby/shadow-file`)
const gatsbySiteMetadataResource = require(`./providers/gatsby/site-metadata`)
const npmPackageResource = require(`./providers/npm/package`)
const npmPackageScriptResource = require(`./providers/npm/script`)
const npmPackageJsonResource = require(`./providers/npm/package-json`)
const gitIgnoreResource = require(`./providers/git/ignore`)
const contentfulSpace = require(`./providers/contentful/space`)
const contentfulEnvironment = require(`./providers/contentful/environment`)
const contentfulType = require(`./providers/contentful/type`)
const contentfulEntry = require(`./providers/contentful/entry`)

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

module.exports = componentResourceMapping
