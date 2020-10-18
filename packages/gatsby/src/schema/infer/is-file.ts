import path from "path"
import { slash } from "gatsby-core-utils"
import mime from "mime"
import isRelative from "is-relative"
import isRelativeUrl from "is-relative-url"
import { getValueAt } from "../../utils/get-value-at"
import { getNode, getNodesByType } from "../../redux/nodes"
import { IGatsbyNode } from "../../redux/types"

const getFirstValueAt = (
  node: IGatsbyNode,
  selector: string | Array<string>
): string => {
  let value = getValueAt(node, selector)
  while (Array.isArray(value)) {
    value = value[0]
  }
  return value
}

const withBaseDir = (dir: string) => (p: string): string =>
  path.posix.join(dir, slash(p))

const findAncestorNode = (
  childNode: IGatsbyNode,
  predicate: (n: IGatsbyNode) => boolean
): IGatsbyNode | null => {
  let node: IGatsbyNode | undefined = childNode
  do {
    if (predicate(node)) {
      return node
    }
    node = getNode(node.parent)
  } while (node !== undefined)
  return null
}

const getBaseDir = (node: IGatsbyNode): string | null => {
  if (node) {
    const { dir } = findAncestorNode(
      node,
      node => node.internal.type === `File`
    ) || { dir: `` }
    return typeof dir === `string` ? dir : null
  }
  return null
}

const getAbsolutePath = (
  node: IGatsbyNode,
  relativePath: string
): string | Array<string> | null => {
  const dir = getBaseDir(node)
  const withDir = withBaseDir(dir ?? ``)
  return dir
    ? Array.isArray(relativePath)
      ? relativePath.map(withDir)
      : withDir(relativePath)
    : null
}

const getFilePath = (
  fieldPath: string,
  relativePath: string
): string | Array<string> | null => {
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
  const node = getNodesByType(typeName).find(
    node => getFirstValueAt(node, selector) === normalizedPath
  )

  return node ? getAbsolutePath(node, normalizedPath) : null
}

export const isFile = (fieldPath: string, relativePath: string): boolean => {
  const filePath = getFilePath(fieldPath, relativePath)
  if (!filePath) return false
  const filePathExists = getNodesByType(`File`).some(
    node => node.absolutePath === filePath
  )
  return filePathExists
}
