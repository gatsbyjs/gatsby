import { Node, Store, Cache, Actions, Reporter, PluginOptions } from 'gatsby'
import * as path from "path"
import * as fs from "fs-extra"

/**
 * @see https://www.gatsbyjs.org/packages/gatsby-source-filesystem/?=files#createfilepath
 */
export function createFilePath(args: ICreateFilePathArgs): string

/**
 * @see https://www.gatsbyjs.org/packages/gatsby-source-filesystem/?=files#createremotefilenode
 */
export function createRemoteFileNode(
  args: ICreateRemoteFileNodeArgs
): Promise<IFileSystemNode>

/**
 * @see https://www.gatsbyjs.org/packages/gatsby-source-filesystem/?=files#createfilenodefrombuffer
 */
export function createFileNodeFromBuffer(
  args: ICreateFileNodeFromBufferArgs
): Promise<IFileSystemNode>

export interface ICreateFilePathArgs {
  node: Node
  getNode: Function
  basePath?: string
  trailingSlash?: boolean
}

interface ICreateNodeAbstract {
  store?: Store
  cache: Cache
  getCache: (directory: string) => Cache
  createNode: Actions["createNode"]
  createNodeId: Function
  parentNodeId?: string
  ext?: string
  name?: string
}

export interface IHtaccesAuthentication {
  htaccess_user?: string
  htaccess_pass?: string
}

export interface ICreateRemoteFileNodeArgs extends ICreateNodeAbstract {
  url: string
  auth: IHtaccesAuthentication
  httpHeaders?: object
  reporter: Reporter
}

export interface ICreateFileNodeFromBufferArgs extends ICreateNodeAbstract{
  buffer: Buffer
  hash?: string
}

type ID = string
type NodeLink = string
type DateTime = number

interface IFileInternal {
  content?: string
  contentDigest: string
  description?: string
  fieldOwners?: Array<string>
  ignoreType?: boolean
  mediaType?: string
  type: string
}

export interface IFileSystemNode extends Node, path.ParsedPath, fs.Stats {
  sourceInstanceName: string
  relativeDirectory: string
  relativePath: string
  absolutePath: string
  extension: string
  size: number

  prettySize: string
  modifiedTime: DateTime
  accessTime: DateTime
  changeTime: DateTime
  birthTime: DateTime

  parent: NodeLink
  children: Array<NodeLink>
  internal: Node["internal"] & IFileInternal
}
