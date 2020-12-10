export function genericOnError({ reporter }, event): void {
  const error = event.data
  reporter?.panicOnBuild(error)
}
