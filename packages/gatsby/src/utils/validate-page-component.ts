import path from "path"
import fs from "fs-extra"
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
  if (!component) {
    throw new Error(`11322`)
  }
  if (validationCache.has(component)) {
    return {}
  }
  if (!path.isAbsolute(component)) {
    return {
      error: {
        id: `11326`,
        context: {
          pluginName,
          pageObject: page,
          component: component,
        },
      },
      message: `${pluginName} must set the absolute path to the page component when create creating a page`,
    }
  }

  if (isNotTestEnv) {
    if (!fs.existsSync(component)) {
      return {
        error: {
          id: `11325`,
          context: {
            pluginName,
            pageObject: page,
            component: component,
          },
        },
      }
    }
  }

  // Validate that the page component imports React and exports something
  // (hopefully a component).
  //

  if (!component.includes(`/.cache/`) && isProductionEnv) {
    const fileContent = fs.readFileSync(component, `utf-8`)

    if (fileContent === ``) {
      const relativePath = path.relative(directory, component)

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

    // this check only applies to js and ts, not mdx
    if ([`.js`, `.jsx`, `.ts`, `.tsx`].includes(path.extname(component))) {
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
              fileName: component,
            },
          },
          panicOnBuild: true,
        }
      }
    }
  }

  validationCache.add(component)
  return {}
}

export function clearValidationCache(): void {
  validationCache.clear()
}
