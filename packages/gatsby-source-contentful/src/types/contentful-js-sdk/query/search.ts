import { BasicEntryField, EntryFields } from '../entry'
import { ConditionalFixedQueries } from './util'

// TODO: should Boolean field type be excluded
type SupportedTypes = Exclude<BasicEntryField, EntryFields.Integer> | undefined

/**
 * @desc match - full text search
 * @see [documentation]{@link https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters/full-text-search}
 */
export type FullTextSearchFilters<Fields, Prefix extends string> = ConditionalFixedQueries<
  Fields,
  SupportedTypes,
  string,
  Prefix,
  '[match]'
>
