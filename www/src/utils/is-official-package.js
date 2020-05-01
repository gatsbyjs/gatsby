// Checks whether the package from an Algolia NPM search hit is an official Gatsby package
module.exports = function isOfficialPackage(package) {
  return (
    package.repository &&
    !package.startsWith(`@`) &&
    package.repository.url.startsWith(`https://github.com/gatsbyjs/gatsby`)
  )
}
