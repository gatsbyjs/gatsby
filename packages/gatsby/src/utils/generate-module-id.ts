import { generateComponentChunkName } from "./js-chunk-names"

export const generateModuleId = ({
  source,
  type = `default`,
  importName,
}): string =>
  `${generateComponentChunkName(source, `module`)}-${type}-${importName || ``}`
