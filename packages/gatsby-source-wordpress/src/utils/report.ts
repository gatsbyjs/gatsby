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
  },
  [CODES.BadResponse]: {
    text: getErrorText,
    level: `ERROR`,
    category: `USER`,
  },
  [CODES.RequestDenied]: {
    text: getErrorText,
    level: `ERROR`,
    category: `USER`,
  },
  [CODES.Authentication]: {
    text: getErrorText,
    level: `ERROR`,
    category: `USER`,
  },
  [CODES.Timeout]: {
    text: getErrorText,
    level: `ERROR`,
    category: `USER`,
  },
  [CODES.RemoteGraphQLError]: {
    text: getErrorText,
    level: `ERROR`,
    category: `THIRD_PARTY`,
  },
  [CODES.MissingAppendedPath]: {
    text: getErrorText,
    level: `ERROR`,
    category: `THIRD_PARTY`,
  },
  [CODES.SourcePluginCodeError]: {
    text: getErrorText,
    level: `ERROR`,
    category: `SYSTEM`,
  },
  [CODES.WordPress500ishError]: {
    text: getErrorText,
    level: `ERROR`,
    category: `THIRD_PARTY`,
  },
  [CODES.SelfSignedCert]: {
    text: getErrorText,
    level: `ERROR`,
    category: `THIRD_PARTY`,
  },
}
