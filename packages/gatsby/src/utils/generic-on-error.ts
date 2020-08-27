import reporter from "gatsby-cli/lib/reporter"

export const genericOnError = {
  actions: (_ctx, event): void => {
    const error = event.data
    reporter.panicOnBuild(error)
  },
}
