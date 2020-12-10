export function genericOnError({ reporter }, event): void {
  const error = event.data
  // eslint-disable-next-line no-unused-expressions
  reporter?.panicOnBuild(error)
}
