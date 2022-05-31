import type { Node } from "gatsby"

export type IMdxNode = Node

export interface IFileNode extends Node {
  sourceInstanceName?: string
  absolutePath?: string
}

export type NodeMap = Map<string, { fileNode: IFileNode; mdxNode: IMdxNode }>
