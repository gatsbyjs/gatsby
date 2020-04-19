/* eslint-disable @typescript-eslint/no-use-before-define */
import path from "path"
import { slash } from "gatsby-core-utils"
import mime from "mime"
import isRelative from "is-relative"
import isRelativeUrl from "is-relative-url"
import { getValueAt } from "../../utils/get-value-at"
import { Node } from "../../../index"
import { INodeStore } from "../../db/types"

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

const getFirstValueAt = (node: Node, selector: string | string[]): any => {
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
    .find((node: Node) => getFirstValueAt(node, selector) === normalizedPath)

  return node ? getAbsolutePath(nodeStore, node, normalizedPath) : null
}

const getAbsolutePath = (
  nodeStore: INodeStore,
  node: Node,
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

const getBaseDir = (nodeStore: INodeStore, node: Node): string | null => {
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
  childNode: Node,
  predicate: (n: Node) => boolean
): Node | null => {
  let node: Node | undefined = childNode
  do {
    if (predicate(node)) {
      return node
    }
  } while ((node = node.parent ? nodeStore.getNode(node.parent) : undefined))
  return null
}
