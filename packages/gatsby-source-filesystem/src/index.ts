import * as fs from "fs-extra"
import { IFileSystemNode } from "../index"

export function loadNodeContent(fileNode: IFileSystemNode): Promise<string> {
  return fs.readFile(fileNode.absolutePath, `utf-8`)
}

export { createFilePath } from "./create-file-path"
export { createRemoteFileNode } from "./create-remote-file-node"
export { createFileNodeFromBuffer } from "./create-file-node-from-buffer"
