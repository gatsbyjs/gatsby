export const ERROR_CODES = {
  MdxCompilation: `10001`,
}

export const ERROR_MAP = {
  [ERROR_CODES.MdxCompilation]: {
    text: (context: { errorMeta: string }): string =>
      `Failed to compile MDX. Information about the file:\n${context.errorMeta}`,
    level: `ERROR`,
    type: `PLUGIN`,
    category: `USER`,
  },
}
