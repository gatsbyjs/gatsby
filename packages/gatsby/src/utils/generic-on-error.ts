export function genericOnError({ reporter }: any, event): void {
  const error = event.data
  // eslint-disable-next-line no-unused-expressions
  reporter?.panicOnBuild(error)
}
