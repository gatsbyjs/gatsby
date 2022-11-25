export const requireResolve = (
  id: string,
  options?: { paths?: Array<string> | undefined } | undefined
): string => require.resolve(id, options)
