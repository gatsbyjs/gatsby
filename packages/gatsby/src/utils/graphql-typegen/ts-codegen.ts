import * as fs from "fs-extra"
import { codegen } from "@graphql-codegen/core"
import type { Types } from "@graphql-codegen/plugin-helpers"
import type { TypeScriptPluginConfig } from "@graphql-codegen/typescript/config"
import type { TypeScriptDocumentsPluginConfig } from "@graphql-codegen/typescript-operations/config"
import { DocumentNode } from "graphql"
import { GatsbyReduxStore } from "../../redux"

interface ISource {
  document: DocumentNode
  hash?: string
}

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

export async function writeTypeScriptTypes({
  outputPath,
  namespace,
  store,
  documents,
}: {
  outputPath: string
  namespace: string
  store: GatsbyReduxStore
  documents: Array<ISource>
}): Promise<void> {
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

  const { schema } = store.getState()

  const codegenOptions: Omit<Types.GenerateOptions, "plugins" | "pluginMap"> = {
    // @ts-ignore - Incorrect types
    schema: undefined,
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

  await fs.writeFile(outputPath, result)
}
