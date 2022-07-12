export const ERROR_CODES = {
  MdxCompilation: `10001`,
  NonExistentFileNode: `10002`,
  InvalidAcornAST: `10003`,
  NonDeterminableExportName: `10004`,
  AcornCompilation: `10005`,
}

export const ERROR_MAP = {
  [ERROR_CODES.MdxCompilation]: {
    text: (context: { absolutePath: string }): string =>
      `Failed to compile MDX. Information about the file:\nPath: ${context.absolutePath}`,
    level: `ERROR`,
    type: `PLUGIN`,
    category: `USER`,
  },
  [ERROR_CODES.NonExistentFileNode]: {
    text: (context: { resourcePath: string }): string =>
      `Unable to locate the GraphQL File node for ${context.resourcePath}`,
    level: `ERROR`,
    type: `PLUGIN`,
  },
  [ERROR_CODES.InvalidAcornAST]: {
    text: (context: { source: string }): string =>
      `Invalid AST. Parsed source code did not return valid output. Input source:\n${context.source}`,
    level: `ERROR`,
    type: `PLUGIN`,
    category: `USER`,
  },
  [ERROR_CODES.NonDeterminableExportName]: {
    text: (): string => `Unable to determine default export name`,
    level: `ERROR`,
    type: `PLUGIN`,
  },
  [ERROR_CODES.AcornCompilation]: {
    text: (context: { resourcePath: string }): string =>
      `Unable to inject MDX into JS template:\n${context.resourcePath}`,
    level: `ERROR`,
    type: `PLUGIN`,
  },
}
