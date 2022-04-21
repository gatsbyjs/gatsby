import * as fs from "fs-extra"
import { resolve, join } from "path"
import { GraphQLSchema, printSchema } from "graphql"
import reporter from "gatsby-cli/lib/reporter"
import type { GatsbyReduxStore } from "../../redux"
import type { IStateProgram } from "../../redux/types"
import { stabilizeSchema } from "./utils"

export const OUTPUT_PATHS = {
  schema: `.cache/typegen/schema.graphql`,
  fragments: `.cache/typegen/fragments.graphql`,
  config: `.cache/typegen/graphql.config.json`,
}

export async function writeGraphQLConfig(
  program: IStateProgram
): Promise<void> {
  try {
    const base = program.directory
    const configJSONString = JSON.stringify(
      {
        schema: resolve(base, OUTPUT_PATHS.schema),
        documents: [
          resolve(base, `src/**/**.{ts,js,tsx,jsx}`),
          resolve(base, OUTPUT_PATHS.fragments),
        ],
        extensions: {
          endpoints: {
            default: {
              url: `${program.https ? `https://` : `http://`}${program.host}:${
                program.port
              }/___graphql`,
            },
          },
        },
      },
      null,
      2
    )

    fs.writeFileSync(resolve(base, OUTPUT_PATHS.config), configJSONString)
    reporter.verbose(`Successfully created graphql.config.json`)
  } catch (err) {
    reporter.error(`Failed to write graphql.config.json`, err)
  }
}

export const writeGraphQLFragments =
  (directory: IStateProgram["directory"], store: GatsbyReduxStore) =>
  async (): Promise<void> => {
    try {
      const currentDefinitions = store.getState().definitions

      const fragmentString = Array.from(currentDefinitions.entries())
        .filter(([_, def]) => def.isFragment)
        .map(([_, def]) => `# ${def.filePath}\n${def.printedAst}`)
        .join(`\n`)

      await fs.writeFile(
        join(directory, OUTPUT_PATHS.fragments),
        fragmentString
      )

      reporter.verbose(`Wrote fragments.graphql file to .cache`)
    } catch (err) {
      reporter.error(`Failed to write fragments.graphql to .cache`, err)
    }
  }

const writeSchema = async (
  directory: IStateProgram["directory"],
  schema: GraphQLSchema
): Promise<void> => {
  try {
    const schemaSDLString = printSchema(stabilizeSchema(schema), {
      commentDescriptions: true,
    })
    await fs.writeFile(join(directory, OUTPUT_PATHS.schema), schemaSDLString)

    reporter.verbose(`Successfully created schema.graphql`)
  } catch (err) {
    reporter.error(`Failed to write schema.graphql to .cache`, err)
  }
}

export const writeGraphQLSchema =
  (directory: IStateProgram["directory"], store: GatsbyReduxStore) =>
  async (): Promise<void> => {
    const { schema } = store.getState()
    await writeSchema(directory, schema)
  }
