import { Node } from "gatsby";

/**
 * @see https://www.gatsbyjs.org/packages/gatsby-source-filesystem/?=files#createfilepath
 */
export function createFilePath(args: CreateFilePathArgs): string;

/**
 * @see https://www.gatsbyjs.org/packages/gatsby-source-filesystem/?=files#createremotefilenode
 */
export function createRemoteFileNode(args: CreateRemoteFileNodeArgs): Node;

export interface CreateFilePathArgs {
  node: Node;
  getNode: Function;
  basePath?: string;
  trailingSlash?:boolean;
}

export interface CreateRemoteFileNodeArgs {
  url: string;
  store: object;
  cache: object;
  createNode: Function;
  createNodeId: Function;
  auth?: object;
  ext?: string;
}

export interface FileSystemNode extends Node {
  sourceInstanceName: string;
  absolutePath: string;
  relativePath: string;
  relativeDirectory: string;
  root: string;
  dir: string;
  base: string;
  name: string;
  ext: string;
  extension: string;
  size: number;
  prettySize: string;
  birthtime: string;
  birthtimeMs: number;
  birthTime: string;
  atime: string;
  atimeMs: number;
  accessTime: string;
  ctime: string;
  ctimeMs: number;
  changeTime: string;
  mtime: string;
  mtimeMs: number;
  modifiedTime: string;
  mode: number;
  gid: number;
  uid: number;
}

export interface FileSystemConfig {
  resolve: "gatsby-source-filesystem";
  options: FileSystemOptions;
}

/**
 * @see https://www.gatsbyjs.org/packages/gatsby-source-filesystem/?=filesy#options
 */
export interface FileSystemOptions {
  name: string;
  path: string;
  ignore?: string[];
}
