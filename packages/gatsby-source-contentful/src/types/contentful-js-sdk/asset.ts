import { ContentfulCollection } from './collection'
import { Metadata } from './metadata'
import { EntitySys } from './sys'

export interface AssetDetails {
  size: number
  image?: {
    width: number
    height: number
  }
}

export interface AssetFile {
  url: string
  details: AssetDetails
  fileName: string
  contentType: string
}

export interface AssetFields {
  title?: string
  description?: string
  file?: AssetFile
}

/**
 * @category Entities
 */
export interface Asset {
  sys: AssetSys
  fields: AssetFields
  metadata: Metadata
}

export type AssetMimeType =
  | 'attachment'
  | 'plaintext'
  | 'image'
  | 'audio'
  | 'video'
  | 'richtext'
  | 'presentation'
  | 'spreadsheet'
  | 'pdfdocument'
  | 'archive'
  | 'code'
  | 'markup'

export type AssetCollection = ContentfulCollection<Asset>
export type AssetSys = EntitySys
