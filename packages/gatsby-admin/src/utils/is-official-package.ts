// Checks whether the package from an Algolia NPM search hit is an official Gatsby package
export default function isOfficialPackage(pkg: Record<string, any>): boolean {
  return (
    pkg.repository &&
    !pkg.name.startsWith(`@`) &&
    // if the repo url is the Gatsby monorepo
    (pkg.repository.url === `https://github.com/gatsbyjs/gatsby` ||
      // or the repo url is a specific package in the monorepo
      pkg.repository.url.startsWith(
        `https://github.com/gatsbyjs/gatsby/tree/master/packages/`
      ))
  )
}
