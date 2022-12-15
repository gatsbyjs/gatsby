export type LinkType = 'Space' | 'ContentType' | 'Environment' | 'Entry' | 'Tag' | 'User'

export interface Link<T extends LinkType> {
  type: 'Link'
  linkType: T
  id: string
}

export type SpaceLink = Link<'Space'>
export type ContentTypeLink = Link<'ContentType'>
export type EnvironmentLink = Link<'Environment'>
export type EntryLink = Link<'Entry'>
export type TagLink = Link<'Tag'>
export type UserLink = Link<'User'>
