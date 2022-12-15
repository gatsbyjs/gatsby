import { Document as RichTextDocument } from '@contentful/rich-text-types'
import { Asset } from './asset'
import { ContentfulCollection } from './collection'
import { ContentTypeLink, EntryLink } from './link'
import { LocaleCode } from './locale'
import { Metadata } from './metadata'
import { FieldsType } from './query/util'
import { EntitySys } from './sys'

export interface EntrySys extends EntitySys {
  contentType: { sys: ContentTypeLink }
}

export declare namespace EntryFields {
  type Symbol = string
  type Text = string
  type Integer = number
  type Number = number
  type Date = `${number}-${number}-${number}T${number}:${number}:${number}Z`
  type Boolean = boolean

  type Location = {
    lat: number
    lon: number
  }

  type Link<T extends FieldsType> = Asset | Entry<T>
  type Array<T = any> = symbol[] | Entry<T>[] | Asset[]
  type Object<T extends Record<string, any> = Record<string, unknown>> = T
  type RichText = RichTextDocument
}

export type BasicEntryField =
  | EntryFields.Symbol
  | EntryFields.Text
  | EntryFields.Integer
  | EntryFields.Number
  | EntryFields.Date
  | EntryFields.Boolean
  | EntryFields.Location
  | EntryFields.RichText
  | EntryFields.Object

/**
 * @category Entities
 */
export interface Entry<T> {
  sys: EntrySys
  metadata: Metadata
  fields: T
}

export interface EntryWithAllLocalesAndWithoutLinkResolution<
  Fields extends FieldsType,
  Locales extends LocaleCode
> {
  sys: EntrySys
  metadata: Metadata
  fields: {
    [FieldName in keyof Fields]: {
      [LocaleName in Locales]?: Fields[FieldName] extends EntryFields.Link<any>
        ? EntryLink
        : Fields[FieldName] extends EntryFields.Link<any>[]
        ? EntryLink[]
        : Fields[FieldName]
    }
  }
}

export type EntryWithLinkResolutionAndWithUnresolvableLinks<Fields extends FieldsType> = {
  sys: EntrySys
  metadata: Metadata
  fields: {
    [FieldName in keyof Fields]: Fields[FieldName] extends EntryFields.Link<infer LinkedEntryFields>
      ? EntryWithLinkResolutionAndWithUnresolvableLinks<LinkedEntryFields> | EntryLink
      : Fields[FieldName] extends EntryFields.Link<infer LinkedEntryFields>[]
      ? (EntryWithLinkResolutionAndWithUnresolvableLinks<LinkedEntryFields> | EntryLink)[]
      : Fields[FieldName]
  }
}

export type EntryWithAllLocalesAndWithLinkResolutionAndWithUnresolvableLinks<
  Fields extends FieldsType,
  Locales extends LocaleCode
> = {
  sys: EntrySys
  metadata: Metadata
  fields: {
    [FieldName in keyof Fields]: {
      [LocaleName in Locales]?: Fields[FieldName] extends EntryFields.Link<infer LinkedEntryFields>
        ?
            | EntryWithAllLocalesAndWithLinkResolutionAndWithUnresolvableLinks<
                LinkedEntryFields,
                Locales
              >
            | undefined
        : Fields[FieldName] extends Array<EntryFields.Link<infer LinkedEntryFields>>
        ?
            | EntryWithAllLocalesAndWithLinkResolutionAndWithUnresolvableLinks<
                LinkedEntryFields,
                Locales
              >[]
            | undefined
        : Fields[FieldName]
    }
  }
}

export type EntryWithLinkResolutionAndWithoutUnresolvableLinks<Fields extends FieldsType> = {
  sys: EntrySys
  metadata: Metadata
  fields: {
    [FieldName in keyof Fields]: Fields[FieldName] extends EntryFields.Link<infer LinkedEntryFields>
      ? EntryWithLinkResolutionAndWithoutUnresolvableLinks<LinkedEntryFields> | undefined
      : Fields[FieldName] extends EntryFields.Link<infer LinkedEntryFields>[]
      ? EntryWithLinkResolutionAndWithoutUnresolvableLinks<LinkedEntryFields>[] | undefined
      : Fields[FieldName]
  }
}

export type EntryWithAllLocalesAndWithLinkResolutionAndWithoutUnresolvableLinks<
  Fields extends FieldsType,
  Locales extends LocaleCode
> = {
  sys: EntrySys
  metadata: Metadata
  fields: {
    [FieldName in keyof Fields]: {
      [LocaleName in Locales]?: Fields[FieldName] extends EntryFields.Link<infer LinkedEntryFields>
        ?
            | EntryWithAllLocalesAndWithLinkResolutionAndWithoutUnresolvableLinks<
                LinkedEntryFields,
                Locales
              >
            | undefined
        : Fields[FieldName] extends EntryFields.Link<infer LinkedEntryFields>[]
        ?
            | EntryWithAllLocalesAndWithLinkResolutionAndWithoutUnresolvableLinks<
                LinkedEntryFields,
                Locales
              >[]
            | undefined
        : Fields[FieldName]
    }
  }
}

export interface AbstractEntryCollection<TEntry> extends ContentfulCollection<TEntry> {
  errors?: Array<any>
  includes?: {
    Entry?: any[]
    Asset?: any[]
  }
}

export type EntryCollection<T> = AbstractEntryCollection<Entry<T>>

export type EntryWithoutLinkResolution<T> = Entry<T>

export type EntryCollectionWithoutLinkResolution<T> = EntryCollection<T>

export type EntryCollectionWithLinkResolutionAndWithUnresolvableLinks<T extends FieldsType> =
  AbstractEntryCollection<EntryWithLinkResolutionAndWithUnresolvableLinks<T>>

export type EntryCollectionWithAllLocalesAndWithoutLinkResolution<
  Fields extends FieldsType,
  Locales extends LocaleCode
> = AbstractEntryCollection<EntryWithAllLocalesAndWithoutLinkResolution<Fields, Locales>>

export type EntryCollectionWithAllLocalesAndWithLinkResolutionAndWithUnresolvableLinks<
  Fields extends FieldsType,
  Locales extends LocaleCode
> = AbstractEntryCollection<
  EntryWithAllLocalesAndWithLinkResolutionAndWithUnresolvableLinks<Fields, Locales>
>

export type EntryCollectionWithLinkResolutionAndWithoutUnresolvableLinks<
  Fields extends FieldsType
> = AbstractEntryCollection<EntryWithLinkResolutionAndWithoutUnresolvableLinks<Fields>>

export type EntryCollectionWithAllLocalesAndWithLinkResolutionAndWithoutUnresolvableLinks<
  Fields extends FieldsType,
  Locales extends LocaleCode
> = AbstractEntryCollection<
  EntryWithAllLocalesAndWithLinkResolutionAndWithoutUnresolvableLinks<Fields, Locales>
>
