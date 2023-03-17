import { ContentfulCollection } from './collection'
import { EntryFields } from './entry'
import { SpaceLink, EnvironmentLink } from './link'
import { BaseSys } from './sys'

export interface ContentTypeSys extends BaseSys {
  createdAt: EntryFields.Date
  updatedAt: EntryFields.Date
  revision: number
  space: { sys: SpaceLink }
  environment: { sys: EnvironmentLink }
}

export interface ContentTypeField {
  disabled: boolean
  id: string
  linkType?: string
  localized: boolean
  name: string
  omitted: boolean
  required: boolean
  type: ContentTypeFieldType
  validations: ContentTypeFieldValidation[]
  items?: FieldItem
  allowedResources?: ContentTypeAllowedResources[]
}

interface ContentTypeAllowedResources {
  type: string
  source: string
  contentTypes: string[]
}

export type ContentTypeFieldType =
  | 'Symbol'
  | 'Text'
  | 'Integer'
  | 'Number'
  | 'Date'
  | 'Boolean'
  | 'Location'
  | 'Link'
  | 'Array'
  | 'Object'
  | 'RichText'
  | 'ResourceLink'

export interface ContentTypeFieldValidation {
  unique?: boolean
  size?: {
    min?: number
    max?: number
  }
  regexp?: {
    pattern: string
  }
  linkMimetypeGroup?: string[]
  in?: string[]
  linkContentType?: string[]
  message?: string
  nodes?: {
    'entry-hyperlink'?: ContentTypeFieldValidation[]
    'embedded-entry-block'?: ContentTypeFieldValidation[]
    'embedded-entry-inline'?: ContentTypeFieldValidation[]
  }
  enabledNodeTypes?: string[]
}

export interface FieldItem {
  type: 'Link' | 'Symbol' | 'ResourceLink'
  validations: ContentTypeFieldValidation[]
  linkType?: 'Entry' | 'Asset'
}

/**
 * @category Entities
 */
export interface ContentType {
  sys: ContentTypeSys
  name: string
  description: string
  displayField: string
  fields: Array<ContentTypeField>
}

export type ContentTypeCollection = ContentfulCollection<ContentType>
