import reporter from "gatsby-cli/lib/reporter"

export function genericOnError(_ctx, event): void {
  const error = event.data
  reporter.panicOnBuild(error)
}
