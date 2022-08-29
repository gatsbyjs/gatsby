import traverse from "@babel/traverse"
import type { Node } from "@babel/core"

export interface ICollectedSlice {
  name: string
  allowEmpty: boolean
}

export type ICollectedSlices = Record<string, ICollectedSlice>

const SLICE_NAME_PROP = `sliceName`

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

      let name: string | undefined
      let allowEmpty = false
      // TODO: probably want to use something higher level (like babel-jsx-utils)
      // to "calc" attribute values instead of trying to handle AST ourselves
      for (const attribute of nodePath.node.attributes) {
        if (attribute.type === `JSXAttribute`) {
          if (attribute.name.name === SLICE_NAME_PROP) {
            if (attribute.value?.type === `StringLiteral`) {
              name = attribute.value.value
            } else {
              console.warn(`Not literal value for "${attribute.name.name}"`, {
                filename,
                value: attribute.value,
              })
            }
          } else if (attribute.name.name === `allowEmpty`) {
            if (attribute.value === null) {
              allowEmpty = true
            } else {
              console.warn(`allowEmpty can't get any value`, {
                filename,
              })
            }
          }
        } else if (attribute.type === `JSXSpreadAttribute`) {
          // this needs special handling - not sure if worth doing so
          // will leave it for when we use `getAttributeValues` from babel-jsx-utils
          // as we do for `<StaticImage>` instead of digging into AST ourselves
          // to potentially support spread props that can be analyzed?
        }
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
