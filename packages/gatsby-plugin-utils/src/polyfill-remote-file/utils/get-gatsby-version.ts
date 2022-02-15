let GATSBY_VERSION: string

export function getGatsbyVersion(): string {
  if (!GATSBY_VERSION) {
    const gatsbyJSON = require(`gatsby/package.json`)
    GATSBY_VERSION = gatsbyJSON.version
  }

  return GATSBY_VERSION
}
