import { IErrorMapEntry } from "gatsby-cli/lib/structured-errors/error-map"

export const CODES = {
  /* Fetch errors */
  WordPressFilters: `111001`,
  BadResponse: `111002`,
  RequestDenied: `111004`,
  Authentication: `111005`,
  Timeout: `111006`,
  WordPress500ishError: `111007`,
  SelfSignedCert: `111008`,

  /* GraphQL Errors */
  RemoteGraphQLError: `112001`,
  MissingAppendedPath: `112002`,
  InconsistentSchemaCustomization: `112004`,

  /* CodeErrors */
  SourcePluginCodeError: `112003`,
}

interface IErrorContext {
  sourceMessage: string
}
interface IErrorMap {
  [code: string]: IErrorMapEntry
}

const getErrorText = (context: IErrorContext): string => context.sourceMessage

export const ERROR_MAP: IErrorMap = {
  [CODES.WordPressFilters]: {
    text: getErrorText,
    level: `ERROR`,
    category: `USER`,
    type: `PLUGIN`,
  },
  [CODES.BadResponse]: {
    text: getErrorText,
    level: `ERROR`,
    category: `USER`,
    type: `PLUGIN`,
  },
  [CODES.RequestDenied]: {
    text: getErrorText,
    level: `ERROR`,
    category: `USER`,
    type: `PLUGIN`,
  },
  [CODES.Authentication]: {
    text: getErrorText,
    level: `ERROR`,
    category: `USER`,
    type: `PLUGIN`,
  },
  [CODES.Timeout]: {
    text: getErrorText,
    level: `ERROR`,
    category: `USER`,
    type: `PLUGIN`,
  },
  [CODES.RemoteGraphQLError]: {
    text: getErrorText,
    level: `ERROR`,
    category: `THIRD_PARTY`,
    type: `PLUGIN`,
  },
  [CODES.MissingAppendedPath]: {
    text: getErrorText,
    level: `ERROR`,
    category: `THIRD_PARTY`,
    type: `PLUGIN`,
  },
  [CODES.InconsistentSchemaCustomization]: {
    text: getErrorText,
    level: `ERROR`,
    category: `SYSTEM`,
    type: `PLUGIN`,
  },
  [CODES.SourcePluginCodeError]: {
    text: getErrorText,
    level: `ERROR`,
    category: `SYSTEM`,
    type: `PLUGIN`,
  },
  [CODES.WordPress500ishError]: {
    text: getErrorText,
    level: `ERROR`,
    category: `THIRD_PARTY`,
    type: `PLUGIN`,
  },
  [CODES.SelfSignedCert]: {
    text: getErrorText,
    level: `ERROR`,
    category: `THIRD_PARTY`,
    type: `PLUGIN`,
  },
}
