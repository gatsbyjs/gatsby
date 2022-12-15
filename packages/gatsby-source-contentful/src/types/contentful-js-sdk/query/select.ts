import { FieldsType } from './util'

/**
 * @desc select
 * @see [documentation]{@link https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters/select-operator}
 */
export type SelectFilter<Fields extends FieldsType, Prefix extends string> = {
  select?: (
    | `${string}.${string}`
    | `${Prefix}.${keyof Fields & string}`
    | `${Prefix}.${keyof Fields & string}.${string}`
  )[]
}
