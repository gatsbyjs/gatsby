import * as path from "path"
import { Node } from "gatsby"
import { slash } from "gatsby-core-utils"
import { ICreateFilePathArgs, IFileSystemNode } from "../"

function findFileNode({
  node,
  getNode,
}: {
  node: Node
  getNode: Function
  basePath?: string
  trailingSlash?: boolean
}): IFileSystemNode {
  // Find the file node.
  let fileNode = node as IFileSystemNode

  let whileCount = 0
  while (
    fileNode.internal.type !== `File` &&
    fileNode.parent &&
    getNode(fileNode.parent) !== undefined &&
    whileCount < 101
  ) {
    fileNode = getNode(fileNode.parent)

    whileCount += 1
    if (whileCount > 100) {
      console.log(
        `It looks like you have a node that's set its parent as itself`,
        fileNode
      )
    }
  }

  return fileNode
}

export function createFilePath({
  node,
  getNode,
  basePath = `src/pages`,
  trailingSlash = true,
}: ICreateFilePathArgs): undefined | string {
  // Find the File node
  const fileNode = findFileNode({ node, getNode })
  if (!fileNode) return undefined

  const relativePath = path.posix.relative(
    slash(basePath),
    slash(fileNode.relativePath)
  )
  const { dir = ``, name } = path.parse(relativePath)
  const parsedName = name === `index` ? `` : name

  return path.posix.join(`/`, dir, parsedName, trailingSlash ? `/` : ``)
}
