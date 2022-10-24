export const ERROR_CODES = {
  MdxCompilation: `10001`,
  NonExistentFileNode: `10002`,
  InvalidAcornAST: `10003`,
  NonDeterminableExportName: `10004`,
  AcornCompilation: `10005`,
}

export const ERROR_MAP = {
  [ERROR_CODES.MdxCompilation]: {
    text: (context: { absolutePath: string; errorMeta: any }): string =>
      `Failed to compile the file "${context.absolutePath}". Original error message:\n\n${context.errorMeta.message}`,
    level: `ERROR`,
    type: `PLUGIN`,
    category: `USER`,
  },
  [ERROR_CODES.NonExistentFileNode]: {
    text: (context: { resourcePath: string; mdxPath?: string }): string =>
      `Unable to locate the GraphQL File node for ${context.resourcePath}${
        context.mdxPath ? `\nFile: ${context.mdxPath}` : ``
      }`,
    level: `ERROR`,
    type: `PLUGIN`,
  },
  [ERROR_CODES.InvalidAcornAST]: {
    text: (context: { resourcePath: string; mdxPath?: string }): string =>
      `Invalid AST. Parsed source code did not return valid output.\n\nTemplate:\n${
        context.resourcePath
      }${context.mdxPath ? `\nFile: ${context.mdxPath}` : ``}`,
    level: `ERROR`,
    type: `PLUGIN`,
    category: `USER`,
  },
  [ERROR_CODES.NonDeterminableExportName]: {
    text: (context: { resourcePath: string }): string =>
      `Unable to determine default export name for file:\n${context.resourcePath}`,
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
