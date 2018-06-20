// This module is also copied into the .cache directory some modules copied there
// from cache-dir can also use this module.
export default (moduleName, err) => {
  const regex = new RegExp(
    `Error: Cannot find module\\s.${moduleName.replace(
      /[-/\\^$*+?.()|[\]{}]/g,
      `\\$&`
    )}`
  )
  const firstLine = err.toString().split(`\n`)[0]
  return regex.test(firstLine)
}
