export function requireResolve(
  id: string,
  options?: { paths?: Array<string> | undefined } | undefined,
): string {
  return require.resolve(id, options)
}
