import { codegen } from "@graphql-codegen/core"
import type { Types } from "@graphql-codegen/plugin-helpers"
import type { TypeScriptPluginConfig } from "@graphql-codegen/typescript/config"
import type { TypeScriptDocumentsPluginConfig } from "@graphql-codegen/typescript-operations/config"
import { GraphQLSchema, DocumentNode } from "graphql"
import { writeFileContent } from "../internal/utils"

interface ISource {
  document: DocumentNode
  hash?: string
}

interface ICodegenService {
  (props: { schema: GraphQLSchema; documents: Array<ISource> }): Promise<void>
}

interface IMakeCodegenService {
  (deps: { outputPath: string; namespace: string }): ICodegenService
}

export { makeCodegenService }

// Preset configurations to ensure compatibility with Gatsby.
const DEFAULT_CONFIG = {
  namingConvention: {
    typeNames: `keep`,
    enumValues: `keep`,
    transformUnderscore: false,
  },
  addUnderscoreToArgsType: true,
  skipTypename: true,
  flattenGeneratedTypes: true,
}

const DEFAULT_TYPESCRIPT_SCALARS = {
  // A date string, such as 2007-12-03, compliant with the ISO 8601 standard for
  // representation of dates and times using the Gregorian calendar.
  Date: `string`,

  // The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).
  // Note: This will never be used since this is reserved by GatsbyJS internal
  JSON: `any`,
}

const DEFAULT_TYPESCRIPT_CONFIG: Readonly<TypeScriptPluginConfig> = {
  avoidOptionals: true,
  immutableTypes: true,
  // TODO: Better maybeValue
  maybeValue: `T | undefined`,
  noExport: true,
  enumsAsTypes: true,
  scalars: DEFAULT_TYPESCRIPT_SCALARS,
  useTypeImports: true,
}

const DEFAULT_TYPESCRIPT_OPERATIONS_CONFIG: Readonly<TypeScriptDocumentsPluginConfig> =
  {
    ...DEFAULT_TYPESCRIPT_CONFIG,
    exportFragmentSpreadSubTypes: true,
  }

const makeCodegenService: IMakeCodegenService = ({ outputPath, namespace }) => {
  const pluginConfig: Pick<Types.GenerateOptions, "plugins" | "pluginMap"> = {
    pluginMap: {
      add: require(`@graphql-codegen/add`),
    },
    plugins: [
      {
        add: {
          placement: `prepend`,
          content: `/* eslint-disable */\n`,
        },
      },
    ],
  }

  pluginConfig.pluginMap = {
    ...pluginConfig.pluginMap,
    typescript: require(`@graphql-codegen/typescript`),
    typescriptOperations: require(`@graphql-codegen/typescript-operations`),
  }

  pluginConfig.plugins.push({
    add: {
      placement: `prepend`,
      content: `\ndeclare namespace ${namespace} {\n`,
    },
  })
  pluginConfig.plugins.push({
    typescript: DEFAULT_TYPESCRIPT_CONFIG,
  })
  pluginConfig.plugins.push({
    typescriptOperations: DEFAULT_TYPESCRIPT_OPERATIONS_CONFIG,
  })
  pluginConfig.plugins.push({
    add: {
      placement: `append`,
      content: `\n}\n`,
    },
  })

  return async ({ schema, documents }): Promise<void> => {
    const codegenOptions: Omit<Types.GenerateOptions, "plugins" | "pluginMap"> =
      {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore for inaccurate type definitions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        schema: undefined as any,
        schemaAst: schema,
        documents,
        filename: outputPath,
        config: {
          ...DEFAULT_CONFIG,
        },
      }

    const result = await codegen({
      ...pluginConfig,
      ...codegenOptions,
    })

    await writeFileContent(outputPath, result)
  }
}
