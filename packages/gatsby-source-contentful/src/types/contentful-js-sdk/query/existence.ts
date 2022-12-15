import { BasicEntryField } from '../entry'
import { ConditionalFixedQueries } from './util'

/**
 * @name exists
 * @desc check for existence
 * @see [Documentation]{@link https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters/existence}
 */
export type ExistenceFilter<Fields, Prefix extends string> = ConditionalFixedQueries<
  Fields,
  BasicEntryField | undefined,
  boolean,
  Prefix,
  '[exists]'
>

// TODO: it still includes 'Link' fields
