import { EntitySys } from './sys'
import { ContentfulCollection } from './collection'
import { UserLink } from './link'

export interface TagSys extends Omit<EntitySys, 'locale' | 'revision'> {
  type: 'Tag'
  version: number
  visibility: 'public'
  createdBy: { sys: UserLink }
  updatedBy: { sys: UserLink }
}

export type Tag = {
  name: string
  sys: TagSys
}

export type TagCollection = ContentfulCollection<Tag>
