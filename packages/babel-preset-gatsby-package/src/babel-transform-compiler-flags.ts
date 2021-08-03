import type { NodePath, PluginObj, types, PluginPass } from "@babel/core"

interface IPluginOptions {
  flags: Record<string, string>
  availableFlags: Array<string>
}

export default function compilerFlags(
  {
    types: t,
  }: {
    types: typeof types
  },
  opts: Partial<IPluginOptions>
): PluginObj {
  if (!opts.flags) {
    throw new Error(`flags option needs to be set`)
  }
  if (!opts.availableFlags) {
    throw new Error(`availableFlags option needs to be set`)
  }

  return {
    name: `babel-transform-compiler-flags`,
    visitor: {
      Identifier(
        nodePath: NodePath<types.Identifier>,
        state: PluginPass
      ): void {
        const flags = (state.opts as IPluginOptions).flags
        const availableFlags = (state.opts as IPluginOptions).availableFlags

        if (
          nodePath.node.name === `_CFLAGS_` &&
          t.isMemberExpression(nodePath.parent)
        ) {
          const cFlag = (nodePath.parent.property as types.Identifier).name

          if (!availableFlags.includes(cFlag)) {
            throw new Error(
              `${cFlag} is not part of the available compiler flags.`
            )
          }

          nodePath.parentPath.replaceWith(
            t.stringLiteral(flags[cFlag] ? flags[cFlag] : ``)
          )
        }
      },
    },
  }
}
