const errorMap = {
  "": {
    text: context => {
      const sourceMessage = context.sourceMessage
        ? context.sourceMessage
        : `There was an error`
      return sourceMessage
    },
    level: `ERROR`,
  },
  "95312": {
    text: () => `"window" is not available during server side rendering.`,
    level: `ERROR`,
    docsUrl: `https://gatsby.dev/debug-html`,
  },
  "95313": {
    text: context =>
      `Building static HTML failed${
        context.errorPath ? ` for path "${context.errorPath}"` : ``
      }`,
    level: `ERROR`,
    docsUrl: `https://gatsby.dev/debug-html`,
  },
  "98123": {
    text: context => `${context.stageLabel} failed\n\n${context.message}`,
    type: `WEBPACK`,
    level: `ERROR`,
  },
  "85901": {
    text: context =>
      `There was an error in your GraphQL query:\n\n${context.sourceMessage}`,
    type: `GRAPHQL`,
    level: `ERROR`,
  },
  "85907": {
    text: context =>
      `There was an error in your GraphQL query:\n\n${context.message}`,
    type: `GRAPHQL`,
    level: `ERROR`,
  },
  "85908": {
    text: context => {
      const closetFragment = context.closestFragment
        ? `\n\nDid you mean to use ` + `"${context.closestFragment}"?`
        : ``

      return `There was an error in your GraphQL query:\n\nThe fragment "${
        context.fragmentName
      }" does not exist.${closetFragment}`
    },
    type: `GRAPHQL`,
    level: `ERROR`,
  },
  "85909": {
    text: context => context.sourceMessage,
    type: `GRAPHQL`,
    level: `ERROR`,
  },
  // Config errors
  "10123": {
    text: context =>
      `We encountered an error while trying to load your site's ${
        context.configName
      }. Please fix the error and try again.`,
    type: `CONFIG`,
    level: `ERROR`,
  },
  "10124": {
    text: context =>
      `It looks like you were trying to add the config file? Please rename "${
        context.nearMatch
      }" to "${context.configName}.js"`,
    type: `CONFIG`,
    level: `ERROR`,
  },
  "10125": {
    text: context =>
      `Your ${
        context.configName
      } file is in the wrong place. You've placed it in the src/ directory. It must instead be at the root of your site next to your package.json file.`,
    type: `CONFIG`,
    level: `ERROR`,
  },
}

module.exports = { errorMap, defaultError: errorMap[``] }
