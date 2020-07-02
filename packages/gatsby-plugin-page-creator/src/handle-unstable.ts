// This will be removed when these features land stable
export function handleUnstable(someString: string): string {
  return someString.replace(/unstable_/g, ``)
}
