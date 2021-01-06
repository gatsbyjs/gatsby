import { NodePath, PluginObj } from "@babel/core"
import { store } from "../redux"
import reporter from "gatsby-cli/lib/reporter"

export default function babelPluginPageTemplateSupportFastRefresh({
  ...babel
}): PluginObj {
  let onWarning: ((reason: string | Error) => void) | null = null
  const hasOnWarning = typeof onWarning === `function`
  babel.caller(caller => {
    onWarning = caller.onWarning
    return `` // Intentionally empty to not invalidate cache
  })

  console.log({ onWarning })

  const warn = onWarning

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
          if (hasOnWarning) {
            warn(
              path.buildCodeFrameError(
                `${message}\n\nFilename: ${filename}\n\n`
              ).message
            )
          }
        }

        path.traverse({
          ExportDefaultDeclaration: path => {
            const declaration = path.node.declaration
            if (declaration.type === `FunctionDeclaration`) {
              if (!declaration.id) {
                makeWarning(
                  path,
                  `[FAST REFRESH]
Anonymous function declarations cause Fast Refresh to not preserve local component state.

Please add a name to your function, for example:

Before:
export default function () {};

After:
export default function Named() {}
`
                )
              } else if (
                declaration.id?.name[0] !==
                declaration.id?.name[0].toLocaleUpperCase()
              ) {
                makeWarning(
                  path,
                  `[FAST REFRESH]
Lowercase components cause Fast Refresh to not preserve local component state. You must use PascalCase.

Change "${
                    declaration.id.name
                  }" to "${declaration.id.name[0].toLocaleUpperCase()}${declaration.id.name.substring(
                    1
                  )}"`
                )
              }
            } else if (declaration.type === `ArrowFunctionExpression`) {
              makeWarning(
                path,
                `[FAST REFRESH]
Anonymous arrow functions cause Fast Refresh to not preserve local component state.

Please add a name to your function, for example:

Before:
export default () => {};

After:
const Named = () => {};
export default Named;
`
              )
            } else if (
              declaration.type === `Identifier` &&
              declaration?.name[0] !== declaration?.name[0].toLocaleUpperCase()
            ) {
              makeWarning(
                path,
                `[FAST REFRESH]
Lowercase components cause Fast Refresh to not preserve local component state. You must use PascalCase.

Change the component and default export from "${
                  declaration.name
                }" to "${declaration.name[0].toLocaleUpperCase()}${declaration.name.substring(
                  1
                )}"`
              )
            }
          },
          ExportNamedDeclaration: path => {
            // At this point page query export is already removed
            makeWarning(
              path,
              `[FAST REFRESH]
In page templates only a default export of a valid React component and the named export of a page query is allowed.
All other named exports will cause Fast Refresh to not preserve local component state and do a full refresh.

Please move your other named exports to another file.`
            )
          },
        })
      },
    },
  }
}
