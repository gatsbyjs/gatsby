import * as fs from "fs-extra"
import { join } from "path"
import { slash } from "gatsby-core-utils"
import { codegen } from "@graphql-codegen/core"
import { Kind } from "graphql"
import type { Types } from "@graphql-codegen/plugin-helpers"
import type { TypeScriptPluginConfig } from "@graphql-codegen/typescript/config"
import type { TypeScriptDocumentsPluginConfig } from "@graphql-codegen/typescript-operations/config"
import { AnyAction, Store } from "redux"
import { IGatsbyState, IStateProgram } from "../../redux/types"
import { filterTargetDefinitions, stabilizeSchema } from "./utils"

const OUTPUT_PATH = `src/gatsby-types.d.ts`
const NAMESPACE = `Queries`

const DEFAULT_TYPESCRIPT_CONFIG: Readonly<TypeScriptPluginConfig> = {
  avoidOptionals: true,
  immutableTypes: true,
  // TODO: Better maybeValue
  maybeValue: `T | undefined`,
  noExport: true,
  enumsAsTypes: true,
  scalars: {
    Date: `string`,
    JSON: `any`,
  },
  useTypeImports: true,
}

const DEFAULT_TYPESCRIPT_OPERATIONS_CONFIG: Readonly<TypeScriptDocumentsPluginConfig> =
  {
    ...DEFAULT_TYPESCRIPT_CONFIG,
    exportFragmentSpreadSubTypes: true,
  }

export async function writeTypeScriptTypes(
  directory: IStateProgram["directory"],
  store: Store<IGatsbyState, AnyAction>
): Promise<void> {
  const pluginConfig: Pick<Types.GenerateOptions, "plugins" | "pluginMap"> = {
    pluginMap: {
      add: require(`@graphql-codegen/add`),
      typescript: require(`@graphql-codegen/typescript`),
      typescriptOperations: require(`@graphql-codegen/typescript-operations`),
    },
    plugins: [
      {
        add: {
          placement: `prepend`,
          content: `/* eslint-disable */\n`,
        },
      },
      {
        add: {
          placement: `prepend`,
          content: `declare namespace ${NAMESPACE} {\n`,
        },
      },
      {
        typescript: DEFAULT_TYPESCRIPT_CONFIG,
      },
      {
        typescriptOperations: DEFAULT_TYPESCRIPT_OPERATIONS_CONFIG,
      },
      {
        add: {
          placement: `append`,
          content: `\n}\n`,
        },
      },
    ],
  }

  const { schema, definitions } = store.getState()

  const filename = slash(join(directory, OUTPUT_PATH))
  const documents = [...filterTargetDefinitions(definitions).values()].map(
    definitionMeta => {
      return {
        document: {
          kind: Kind.DOCUMENT,
          definitions: [definitionMeta.def],
        },
        hash: definitionMeta.hash.toString(),
      }
    }
  )

  const codegenOptions: Omit<Types.GenerateOptions, "plugins" | "pluginMap"> = {
    // @ts-ignore - Incorrect types
    schema: undefined,
    schemaAst: stabilizeSchema(schema, true),
    documents,
    filename,
    config: {
      namingConvention: {
        typeNames: `keep`,
        enumValues: `keep`,
        transformUnderscore: false,
      },
      addUnderscoreToArgsType: true,
      skipTypename: true,
      flattenGeneratedTypes: true,
    },
  }

  const result = await codegen({
    ...pluginConfig,
    ...codegenOptions,
  })

  await fs.outputFile(filename, result)
}
