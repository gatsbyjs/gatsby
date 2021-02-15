import {
  createFilePath,
  createRemoteFileNode,
  createFileNodeFromBuffer,
  CreateFilePathArgs,
  CreateRemoteFileNodeArgs,
  CreateFileNodeFromBufferArgs,
  FileSystemNode,
} from "gatsby/utils"

/**
 * @deprecated Import from "gatsby/utils" instead
 */

export { createFilePath }

/**
 * @deprecated Import from "gatsby/utils" instead
 */
export { createRemoteFileNode }

/**
 * @deprecated Import from "gatsby/utils" instead
 */
export { createFileNodeFromBuffer }

/**
 * @deprecated Import from "gatsby/utils" instead
 */
export { CreateFilePathArgs }

/**
 * @deprecated Import from "gatsby/utils" instead
 */
export { CreateFileNodeFromBufferArgs }

/**
 * @deprecated Import from "gatsby/utils" instead
 */
export { CreateRemoteFileNodeArgs }

/**
 * @deprecated Import from "gatsby/utils" instead
 */
export { FileSystemNode }
export interface FileSystemConfig {
  resolve: "gatsby-source-filesystem"
  options: FileSystemOptions
}

/**
 * @see https://www.gatsbyjs.org/packages/gatsby-source-filesystem/?=filesy#options
 */
interface FileSystemOptions {
  name: string
  path: string
  ignore?: string[]
}
