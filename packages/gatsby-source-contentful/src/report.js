export const CODES = {
  /* Fetch errors */

  LocalesMissing: `111001`,
  SelfSignedCertificate: `111002`,
  SyncError: `111003`,
  FetchContentTypes: `111004`,
}

export const ERROR_MAP = {
  [CODES.LocalesMissing]: {
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
}
