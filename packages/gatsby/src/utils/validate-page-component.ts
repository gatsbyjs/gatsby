import path from "path"
import fs from "fs-extra"
import { getPathToLayoutComponent } from "gatsby-core-utils/parse-component-path"
import { IGatsbyPage } from "../redux/types"

const validationCache = new Set<string>()

interface IErrorMeta {
  id: string
  context: Record<string, unknown>
}

const isNotTestEnv = process.env.NODE_ENV !== `test`
const isProductionEnv = process.env.NODE_ENV === `production`

export function validatePageComponent(
  page: IGatsbyPage,
  directory: string,
  pluginName: string
): { message?: string; error?: IErrorMeta; panicOnBuild?: boolean } {
  const { component } = page

  // No component path passed
  if (!component) {
    throw new Error(`11322`)
  }

  const cleanComponentPath = getPathToLayoutComponent(component)

  // Component path already validated in previous pass
  if (validationCache.has(cleanComponentPath)) {
    return {}
  }

  // Component path must be absolute
  if (!path.isAbsolute(cleanComponentPath)) {
    return {
      error: {
        id: `11326`,
        context: {
          pluginName,
          pageObject: page,
          component: cleanComponentPath,
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
          id: `11325`,
          context: {
            pluginName,
            pageObject: page,
            component: cleanComponentPath,
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
          id: `11327`,
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
            id: `11328`,
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
