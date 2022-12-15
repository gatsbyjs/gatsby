import { EntryFields } from './entry'
import { SpaceLink, EnvironmentLink } from './link'

export interface BaseSys {
  type: string
  id: string
}

export interface EntitySys extends BaseSys {
  createdAt: EntryFields.Date
  updatedAt: EntryFields.Date
  revision: number
  space: { sys: SpaceLink }
  environment: { sys: EnvironmentLink }
  locale?: string
}
