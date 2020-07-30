const fileResource = require(`./providers/fs/file`)
const directoryResource = require(`./providers/fs/directory`)
const gatsbyPageResource = require(`./providers/gatsby/page`)
const gatsbyPluginResource = require(`./providers/gatsby/plugin`)
const gatsbyShadowFileResource = require(`./providers/gatsby/shadow-file`)
const npmPackageResource = require(`./providers/npm/package`)
const npmPackageScriptResource = require(`./providers/npm/script`)
const npmPackageJsonResource = require(`./providers/npm/package-json`)
const gitIgnoreResource = require(`./providers/git/ignore`)

const componentResourceMapping = {
  File: fileResource,
  Directory: directoryResource,
  GatsbyPage: gatsbyPageResource,
  GatsbyPlugin: gatsbyPluginResource,
  GatsbyShadowFile: gatsbyShadowFileResource,
  NPMPackage: npmPackageResource,
  NPMScript: npmPackageScriptResource,
  NPMPackageJson: npmPackageJsonResource,
  GitIgnore: gitIgnoreResource,
}

module.exports = componentResourceMapping
