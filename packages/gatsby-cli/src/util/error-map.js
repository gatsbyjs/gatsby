export const errorMap = {
  default: {
    text: () => `Unknown error`,
    category: `ERROR`,
  },
  "95312": {
    text: () => `"window" is not available during server side rendering.`,
    category: `ERROR`,
    docsUrl: `https://gatsby.dev/debug-html`,
    // docsUrl: makeDocsUrl(),
  },
  "95313": {
    text: context =>
      `Building static HTML failed ${context.errorPath &&
        `for path "${context.errorPath}"`}`,
    category: `ERROR`,
    docsUrl: `https://gatsby.dev/debug-html`,
    // docsUrl: makeDocsUrl(),
  },
}

export const defaultError = errorMap.default
