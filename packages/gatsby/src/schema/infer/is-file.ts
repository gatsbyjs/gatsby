/* eslint-disable @typescript-eslint/no-use-before-define */
import path from "path"
import { slash } from "gatsby-core-utils"
import mime from "mime"
import isRelative from "is-relative"
import isRelativeUrl from "is-relative-url"
import { getValueAt } from "../../utils/get-value-at"
import { IGatsbyNode } from "../../redux/types"

import * as NodeStore from "../../redux/nodes"

type INodeStore = typeof NodeStore

export const isFile = (
  nodeStore: INodeStore,
  fieldPath: string,
  relativePath: string
): boolean => {
  const filePath = getFilePath(nodeStore, fieldPath, relativePath)
  if (!filePath) return false
  const filePathExists = nodeStore
    .getNodesByType(`File`)
    .some(node => node.absolutePath === filePath)
  return filePathExists
}

const getFirstValueAt = (
  node: IGatsbyNode,
  selector: string | string[]
): string => {
  let value = getValueAt(node, selector)
  while (Array.isArray(value)) {
    value = value[0]
  }
  return value
}

const getFilePath = (
  nodeStore: INodeStore,
  fieldPath: string,
  relativePath: string
): string | string[] | null => {
  const [typeName, ...selector] = Array.isArray(fieldPath)
    ? fieldPath
    : fieldPath.split(`.`)

  if (typeName === `File`) return null

  const looksLikeFile =
    !path.isAbsolute(relativePath) &&
    mime.getType(relativePath) !== null &&
    // FIXME: Do we need all of this?
    mime.getType(relativePath) !== `application/x-msdownload` &&
    isRelative(relativePath) &&
    isRelativeUrl(relativePath)

  if (!looksLikeFile) return null

  const normalizedPath = slash(relativePath)
  const node = nodeStore
    .getNodesByType(typeName)
    .find(
      (node: IGatsbyNode) => getFirstValueAt(node, selector) === normalizedPath
    )

  return node ? getAbsolutePath(nodeStore, node, normalizedPath) : null
}

const getAbsolutePath = (
  nodeStore: INodeStore,
  node: IGatsbyNode,
  relativePath: string
): string | string[] | null => {
  const dir = getBaseDir(nodeStore, node)
  const withDir = withBaseDir(dir ?? ``)
  return dir
    ? Array.isArray(relativePath)
      ? relativePath.map(withDir)
      : withDir(relativePath)
    : null
}

const getBaseDir = (
  nodeStore: INodeStore,
  node: IGatsbyNode
): string | null => {
  if (node) {
    const { dir } = findAncestorNode(
      nodeStore,
      node,
      node => node.internal.type === `File`
    ) || { dir: `` }

    return typeof dir === `string` ? dir : null
  }
  return null
}

const withBaseDir = (dir: string) => (p: string): string =>
  path.posix.join(dir, slash(p))

const findAncestorNode = (
  nodeStore: INodeStore,
  childNode: IGatsbyNode,
  predicate: (n: IGatsbyNode) => boolean
): IGatsbyNode | null => {
  let node: IGatsbyNode | undefined = childNode
  do {
    if (predicate(node)) {
      return node
    }
    node = nodeStore.getNode(node.parent)
  } while (node !== undefined)
  return null
}
