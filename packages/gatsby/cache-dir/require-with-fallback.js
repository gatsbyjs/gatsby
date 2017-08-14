export default function requireWithFallback (mainPath, fallbackPath) {
  let module
  try {
    module = require(mainPath)
  } catch (e) {
    if (e.code === `MODULE_NOT_FOUND`) {
      module = require(fallbackPath)
    } else {
      throw new Error(`Failed to parse ${mainPath} file.`, e)
    }
  }
  return module
}
