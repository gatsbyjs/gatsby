import path from "path"
import fs from "fs-extra"
import { getPathToLayoutComponent } from "gatsby-core-utils/parse-component-path"
import { IPageInput as ICreatePageInput } from "../redux/actions/public"
import { ICreateSliceInput } from "../redux/actions/restricted"

const validationCache = new Set<string>()

interface IErrorMeta {
  id: string
  context: Record<string, unknown>
}

interface IErrorIdMap {
  noPath: string
  notAbsolute: string
  doesNotExist: string
  empty: string
  noDefaultExport: string
}

const isNotTestEnv = process.env.NODE_ENV !== `test`
const isProductionEnv = process.env.NODE_ENV === `production`

export function validateComponent(args: {
  input: ICreatePageInput | ICreateSliceInput
  pluginName: string
  errorIdMap: IErrorIdMap
}): { error?: IErrorMeta; panicOnBuild?: boolean } {
  const { input, pluginName, errorIdMap } = args || {}

  // No component path passed
  if (!input?.component) {
    return {
      error: {
        id: errorIdMap.noPath,
        context: {
          pluginName,
          input,
        },
      },
    }
  }

  const componentPath = getPathToLayoutComponent(input?.component)

  const errorContext = {
    input,
    pluginName,
    componentPath,
  }

  // Component path already validated in previous pass
  if (validationCache.has(componentPath)) {
    return {}
  }

  // Component path must be absolute
  if (!path.isAbsolute(componentPath)) {
    return {
      error: {
        id: errorIdMap.notAbsolute,
        context: errorContext,
      },
    }
  }

  // Component path must exist
  if (isNotTestEnv) {
    if (!fs.existsSync(componentPath)) {
      return {
        error: {
          id: errorIdMap.doesNotExist,
          context: errorContext,
        },
      }
    }
  }

  if (!componentPath.includes(`/.cache/`) && isProductionEnv) {
    const fileContent = fs.readFileSync(componentPath, `utf-8`)

    // Component must not be empty
    if (fileContent === ``) {
      return {
        error: {
          id: errorIdMap.empty,
          context: errorContext,
        },
        panicOnBuild: true,
      }
    }

    // Component must have a default export
    if ([`.js`, `.jsx`, `.ts`, `.tsx`].includes(path.extname(componentPath))) {
      const includesDefaultExport =
        fileContent.includes(`export default`) ||
        fileContent.includes(`module.exports`) ||
        fileContent.includes(`exports.default`) ||
        fileContent.includes(`exports["default"]`) ||
        fileContent.match(/export \{.* as default.*\}/s) ||
        fileContent.match(/export \{\s*default\s*\}/s)

      if (!includesDefaultExport) {
        return {
          error: {
            id: errorIdMap.noDefaultExport,
            context: errorContext,
          },
          panicOnBuild: true,
        }
      }
    }
  }

  validationCache.add(componentPath)
  return {}
}

export function clearValidationCache(): void {
  validationCache.clear()
}
