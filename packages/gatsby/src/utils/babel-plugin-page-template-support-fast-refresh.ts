import { NodePath, PluginObj } from "@babel/core"
import { store } from "../redux"
import reporter from "gatsby-cli/lib/reporter"

const anonymousMessage = ``

export default function babelPluginPageTemplateSupportFastRefresh(): PluginObj {
  return {
    visitor: {
      Program(path, state): void {
        const filename = state?.file?.opts?.filename

        if (!filename) {
          return
        }

        const isPageTemplate = store.getState().components.has(filename)

        if (!isPageTemplate) {
          return
        }

        function makeWarning(path: NodePath<any>, message: string): void {
          reporter.warn(
            path.buildCodeFrameError(`${message}\n\nFilename: ${filename}\n\n`)
              .message
          )
        }

        path.traverse({
          ExportDefaultDeclaration: path => {
            const declaration = path.node.declaration
            if (declaration.type === `FunctionDeclaration`) {
              if (!declaration.id) {
                makeWarning(path, `I need a name`)
              } else if (
                declaration.id?.name[0] !==
                declaration.id?.name[0].toLocaleUpperCase()
              ) {
                makeWarning(
                  path,
                  `I need upper case. Change "${
                    declaration.id.name
                  }" to "${declaration.id.name[0].toLocaleUpperCase()}${declaration.id.name.substring(
                    1
                  )}"`
                )
              }
            } else if (declaration.type === `ArrowFunctionExpression`) {
              makeWarning(
                path,
                `Arrow function - do "const Blah = () => {}; export default Blah;". `
              )
            }
          },
          ExportNamedDeclaration: path => {
            // At this point page query export is already removed
            makeWarning(
              path,
              `There are more exports than default (react template) and page query. Fast refresh won't work`
            )
          },
        })
      },
    },
  }
}
