import type { IErrorMapEntry } from "gatsby-cli/lib/structured-errors/error-map"

export const CODES = {
  /* Fetch errors */
  LocalesMissing: `111001`,
  SelfSignedCertificate: `111002`,
  SyncError: `111003`,
  FetchContentTypes: `111004`,
  GatsbyPluginMissing: `111005`,
  ContentTypesMissing: `111006`,
  FetchTags: `111007`,
  GenericContentfulError: `111008`,
  GatsbyTooOld: `111009`,
}

interface IErrorMap {
  [code: string]: Omit<IErrorMapEntry, `type`>
}

export const ERROR_MAP: IErrorMap = {
  [CODES.LocalesMissing]: {
    text: context => context.sourceMessage,
    level: `ERROR`,
    category: `USER`,
  },
  [CODES.ContentTypesMissing]: {
    text: context => context.sourceMessage,
    level: `ERROR`,
    category: `USER`,
  },
  [CODES.SelfSignedCertificate]: {
    text: context => context.sourceMessage,
    level: `ERROR`,
    category: `USER`,
  },
  [CODES.SyncError]: {
    text: context => context.sourceMessage,
    level: `ERROR`,
    category: `THIRD_PARTY`,
  },
  [CODES.FetchContentTypes]: {
    text: context => context.sourceMessage,
    level: `ERROR`,
    category: `THIRD_PARTY`,
  },
  [CODES.FetchTags]: {
    text: context => context.sourceMessage,
    level: `ERROR`,
    category: `THIRD_PARTY`,
  },
  [CODES.GatsbyPluginMissing]: {
    text: context => context.sourceMessage,
    level: `ERROR`,
    category: `USER`,
  },
  [CODES.GenericContentfulError]: {
    text: context => context.sourceMessage,
    level: `ERROR`,
    category: `THIRD_PARTY`,
  },
  [CODES.GatsbyTooOld]: {
    text: context => context.sourceMessage,
    level: `ERROR`,
    category: `USER`,
  },
}
