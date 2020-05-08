// Checks whether the package from an Algolia NPM search hit is an official Gatsby package
module.exports = function isOfficialPackage(pkg) {
  return (
    pkg.repository &&
    !pkg.name.startsWith(`@`) &&
    pkg.repository.url.startsWith(`https://github.com/gatsbyjs/gatsby`)
  )
}
