import traverse from "@babel/traverse"
import type { Node } from "@babel/core"
import { getAttributeValues } from "babel-jsx-utils"
import reporter from "gatsby-cli/lib/reporter"

export interface ICollectedSlice {
  name: string
  allowEmpty: boolean
}

export type ICollectedSlices = Record<string, ICollectedSlice>

const SLICES_PROPS = new Set([`alias`, `allowEmpty`])

function mergePreviouslyCollectedSlice(
  newInfo: ICollectedSlice,
  previousInfo?: ICollectedSlice
): ICollectedSlice {
  return {
    name: newInfo.name,
    // it's enough for one use of slice that doesn't allow empty
    // to require passing everyhing
    allowEmpty:
      previousInfo?.allowEmpty === false
        ? false
        : previousInfo?.allowEmpty ?? newInfo.allowEmpty,
  }
}

export function mergePreviouslyCollectedSlices(
  newInfo: ICollectedSlices,
  previousInfo?: ICollectedSlices
): ICollectedSlices {
  const ret: ICollectedSlices = previousInfo ?? {}

  for (const [name, info] of Object.entries(newInfo)) {
    ret[name] = mergePreviouslyCollectedSlice(info, ret[name])
  }

  return ret
}

export function collectSlices(
  ast: Node,
  filename: string
): Record<string, ICollectedSlice> | null {
  const result: Record<string, ICollectedSlice> = {}
  let hasResults = false

  traverse(ast, {
    JSXOpeningElement(nodePath): void {
      if (!nodePath.get(`name`).referencesImport(`gatsby`, `Slice`)) {
        return
      }

      const unresolvedProps: Array<string> = []

      const props = getAttributeValues(
        nodePath,
        prop => {
          unresolvedProps.push(prop)
        },
        SLICES_PROPS
      ) as { alias: string; allowEmpty?: boolean }

      const { alias: name, allowEmpty = false } = props

      if (unresolvedProps.length) {
        let locationInFile = ``
        if (nodePath.node.loc?.start?.line) {
          locationInFile = `:${nodePath.node.loc.start.line}`
          if (nodePath.node.loc?.start?.column) {
            locationInFile += `:${nodePath.node.loc.start.column + 1}`
          }
        }

        const error = `[Gatsby Slice API] Could not find values in "${filename}${locationInFile}" for the following props at build time: ${unresolvedProps.join(
          `, `
        )}`

        reporter.warn(error)
        return
      }

      if (name) {
        result[name] = mergePreviouslyCollectedSlice(
          { name, allowEmpty },
          result[name]
        )
        hasResults = true
      }
    },
  })

  return hasResults ? result : null
}
