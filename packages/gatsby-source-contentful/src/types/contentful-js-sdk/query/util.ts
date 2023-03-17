import { ConditionalPick } from 'type-fest'

export type FieldsType = Record<string, any>

export type BaseOrArrayType<T> = T extends Array<infer U> ? U : T

export type NonEmpty<T> = T extends Record<string, never> ? never : T

//TODO: should we also allow ValueType[] for array types
export type ConditionalFixedQueries<
  Fields,
  SupportedTypes,
  ValueType,
  Prefix extends string,
  QueryFilter extends string = ''
> = {
  [FieldName in keyof ConditionalPick<Fields, SupportedTypes> as `${Prefix}.${string &
    FieldName}${QueryFilter}`]?: ValueType
}

export type ConditionalQueries<
  Fields,
  SupportedTypes,
  Prefix extends string,
  QueryFilter extends string = ''
> = {
  [FieldName in keyof ConditionalPick<Fields, SupportedTypes> as `${Prefix}.${string &
    FieldName}${QueryFilter}`]?: Fields[FieldName] extends Array<infer T> ? T[] : Fields[FieldName]
}
