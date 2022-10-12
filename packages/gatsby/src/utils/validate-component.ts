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
  directory: string
  pluginName: string
  errorIdMap: IErrorIdMap
}): { message?: string; error?: IErrorMeta; panicOnBuild?: boolean } {
  const { input, directory, pluginName, errorIdMap } = args || {}
  const { component: componentPath } = input

  // No component path passed
  if (!componentPath) {
    throw new Error(errorIdMap.noPath)
  }

  const cleanComponentPath = getPathToLayoutComponent(componentPath)

  // Component path already validated in previous pass
  if (validationCache.has(cleanComponentPath)) {
    return {}
  }

  // Component path must be absolute
  if (!path.isAbsolute(cleanComponentPath)) {
    return {
      error: {
        id: errorIdMap.notAbsolute,
        context: {
          pluginName,
          component: input,
          componentPath: cleanComponentPath,
        },
      },
      message: `${pluginName} must set the absolute path to the page component when create creating a page`,
    }
  }

  // Component path must exist
  if (isNotTestEnv) {
    if (!fs.existsSync(cleanComponentPath)) {
      return {
        error: {
          id: errorIdMap.doesNotExist,
          context: {
            pluginName,
            component: input,
            componentPath: cleanComponentPath,
          },
        },
      }
    }
  }

  if (!cleanComponentPath.includes(`/.cache/`) && isProductionEnv) {
    const fileContent = fs.readFileSync(cleanComponentPath, `utf-8`)

    // Component must not be empty
    if (fileContent === ``) {
      const relativePath = path.relative(directory, cleanComponentPath)

      return {
        error: {
          id: errorIdMap.empty,
          context: {
            relativePath,
          },
        },
        panicOnBuild: true,
      }
    }

    // Component must have a default export
    if (
      [`.js`, `.jsx`, `.ts`, `.tsx`].includes(path.extname(cleanComponentPath))
    ) {
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
            context: {
              fileName: cleanComponentPath,
            },
          },
          panicOnBuild: true,
        }
      }
    }
  }

  validationCache.add(cleanComponentPath)
  return {}
}

export function clearValidationCache(): void {
  validationCache.clear()
}
