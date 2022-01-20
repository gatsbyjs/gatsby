import path from "path"
import babelRegister, { revert } from "@babel/register"
import { slash } from "gatsby-core-utils"
import type { TransformOptions as BabelOptions } from "@babel/core"

type IgnoreFn = (filename: string) => boolean

let transpilerActive = !!require.extensions[`.ts`]

const doRevert = (): void => {
  revert()
}

export const activateTranspiler = (directory: string): VoidFunction => {
  if (transpilerActive) return doRevert

  const defaultOptions: BabelOptions = {
    sourceMaps: `inline`,
    sourceRoot: directory,
    cwd: directory,
    presets: [
      [
        require.resolve(`babel-preset-gatsby-package`),
        {
          browser: false,
          absoluteRuntime: true,
          nodeVersion: process.version.slice(1),
          esm: false,
        },
      ],
    ],
  }

  const ignoreRules: Array<IgnoreFn> = [
    // Module must be a part of the current project
    (fname): boolean => !fname.startsWith(directory),
    // Module must not be a node_modules dependency of
    // the current project
    (fname): boolean => fname.startsWith(path.join(directory, `node_modules`)),
  ]

  const only = (fname: string): boolean =>
    !ignoreRules.some(cb => cb(slash(fname)))

  babelRegister({
    ...defaultOptions,
    extensions: [`.ts`, `.tsx`, `.js`, `.jsx`],
    only: [only],
  })
  transpilerActive = true

  return doRevert
}
