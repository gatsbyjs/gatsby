import type { GraphQLSchema } from "graphql"
import { printSchema } from "graphql"
import { filterPluginSchema, writeFileContent } from "../internal/utils"

interface IEmitSchemaService {
  (schema: GraphQLSchema): Promise<void>
}

interface IMakeEmitSchemaService {
  (deps: { filePath: string }): IEmitSchemaService
}

export const makeEmitSchemaService: IMakeEmitSchemaService =
  ({ filePath }) =>
  async (schema): Promise<void> => {
    const outputSchema = filterPluginSchema(schema)

    await writeFileContent(
      filePath,
      printSchema(outputSchema, { commentDescriptions: true })
    )
  }
