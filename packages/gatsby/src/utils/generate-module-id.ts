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

  if (!source) {
    throw new Error(`"source was not given.`)
  }

  // this is tricky - we can't try to use require.resolve here, because it's not the same
  // as webpack resolver, so instead it just explicitly checks for path starting with `.`
  if (source.startsWith(`.`)) {
    throw new Error(
      `"source" need to be absolute path or package name. "${source}" was given.`
    )
  }

  return `${generateComponentChunkName(source, `module`)}-${type}-${
    importName || ``
  }`
}
