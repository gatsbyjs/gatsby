export const CODES = {
  Generic: `10000`,
  MissingResource: `10001`,
}

export const pluginPrefix = `gatsby-source-filesystem`

export function prefixId(id) {
  return `${pluginPrefix}_${id}`
}

// TODO: Refactor to use contextual data instead of only context.sourceMessage
// once reporter.setErrorMap is guaranteed to be available
export const ERROR_MAP = {
  [CODES.Generic]: {
    text: context => context.sourceMessage,
    level: `ERROR`,
    type: `PLUGIN`,
  },
  [CODES.MissingResource]: {
    text: context => context.sourceMessage,
    level: `ERROR`,
    type: `PLUGIN`,
    category: `USER`,
  },
}
