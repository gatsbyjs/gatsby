import type { Node } from "gatsby"

export interface IRemoteFileNode extends Node {
  url: string
  mimeType: string
  filename: string
  filesize?: number
}

export interface IRemoteImageNode extends IRemoteFileNode {
  width: number
  height: number
  placeholderUrl?: string
}
