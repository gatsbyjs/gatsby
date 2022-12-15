import { BasicEntryField, EntryFields } from '..'
import { ConditionalQueries, NonEmpty } from './util'

type SubsetFilterTypes = 'in' | 'nin'
type SupportedTypes =
  | Exclude<BasicEntryField, EntryFields.Location | EntryFields.RichText | EntryFields.Object>
  | undefined

/**
 * @desc inclusion & exclusion
 * @see [inclusion documentation]{@link https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters/inclusion}
 * @see [exclusion documentation]{@link https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters/exclusion}
 * @example
 * // {'fields.myField', 'singleValue'}
 * // {'fields.myField', 'firstValue,secondValue'}
 */
export type SubsetFilters<Fields, Prefix extends string> = NonEmpty<
  NonNullable<ConditionalQueries<Fields, SupportedTypes, Prefix, `[${SubsetFilterTypes}]`>>
>
