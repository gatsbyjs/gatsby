export const errorMap = {
  default: {
    text: () => `Unknown error`,
    level: `ERROR`,
  },
  "95312": {
    text: () => `"window" is not available during server side rendering.`,
    level: `ERROR`,
    docsUrl: `https://gatsby.dev/debug-html`,
  },
  "95313": {
    text: context =>
      `Building static HTML failed ${context.errorPath &&
        `for path "${context.errorPath}"`}`,
    level: `ERROR`,
    docsUrl: `https://gatsby.dev/debug-html`,
  },
  "85907": {
    text: context =>
      `There was an error in your GraphQL query:\n\n ${context.message}`,
    type: `GRAPHQL`,
    level: `ERROR`,
  },
}

export const defaultError = errorMap.default
