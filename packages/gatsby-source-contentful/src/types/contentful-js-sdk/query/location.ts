import { ConditionalPick } from 'type-fest'
import { EntryFields } from '../entry'
import { NonEmpty } from './util'

type Types = EntryFields.Location

export type ProximitySearchFilterInput = [number, number] | undefined
export type BoundingBoxSearchFilterInput = [number, number, number, number] | undefined
export type BoundingCircleSearchFilterInput = [number, number, number] | undefined

type BaseLocationFilter<
  Fields,
  SupportedTypes,
  ValueType,
  Prefix extends string,
  QueryFilter extends string = ''
> = NonEmpty<
  NonNullable<{
    [FieldName in keyof ConditionalPick<Fields, SupportedTypes> as `${Prefix}.${string &
      FieldName}[${QueryFilter}]`]?: ValueType
  }>
>

/**
 * @desc near - location proximity search
 * @see [Documentation]{@link https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters/location-proximity-search}
 */
export type ProximitySearchFilter<Fields, Prefix extends string> = BaseLocationFilter<
  Fields,
  Types,
  ProximitySearchFilterInput,
  Prefix,
  'near'
>

/**
 * @desc within - location in a bounding rectangle
 * @see [Documentation]{@link https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters/locations-in-a-bounding-object}
 */
type BoundingBoxSearchFilter<Fields, Prefix extends string> = BaseLocationFilter<
  Fields,
  Types,
  BoundingBoxSearchFilterInput,
  Prefix,
  'within'
>
/**
 * @desc within - location in a bounding circle
 * @see [Documentation]{@link https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters/locations-in-a-bounding-object}
 */
type BoundingCircleSearchFilter<Fields, Prefix extends string> = BaseLocationFilter<
  Fields,
  Types,
  BoundingCircleSearchFilterInput,
  Prefix,
  'within'
>

/**
 * @desc location search
 * @see [proximity]{@link ProximitySearchFilter}
 * @see [bounding rectangle]{@link BoundingBoxSearchFilter}
 * @see [bounding circle]{@link BoundingCircleSearchFilter}
 */
export type LocationSearchFilters<Fields, Prefix extends string> =
  | ProximitySearchFilter<Fields, Prefix>
  | BoundingBoxSearchFilter<Fields, Prefix>
  | BoundingCircleSearchFilter<Fields, Prefix>
