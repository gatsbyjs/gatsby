import { isAbsolute } from "path"
import { generateComponentChunkName } from "./js-chunk-names"

const allowedTypes = [`default`, `named`, `namespace`]

export const generateModuleId = ({
  source,
  type = `default`,
  importName,
}): string => {
  if (!allowedTypes.includes(type)) {
    throw new Error(
      `Type "${type}" not allowed (allowed types: ${allowedTypes
        .map(allowedType => `"${allowedType}"`)
        .join(`, `)}).`
    )
  }

  if (type === `named` && !importName) {
    throw new Error(`Named imports need "importName" argument.`)
  }

  if (!isAbsolute(source)) {
    throw new Error(`"source" need to be absolute path.`)
  }

  return `${generateComponentChunkName(source, `module`)}-${type}-${
    importName || ``
  }`
}
