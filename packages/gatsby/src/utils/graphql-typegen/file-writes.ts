import * as fs from "fs-extra"
import { resolve, join } from "path"
import { printSchema } from "graphql"
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
        schema: OUTPUT_PATHS.schema,
        documents: [`src/**/**.{ts,js,tsx,jsx}`, OUTPUT_PATHS.fragments],
        extensions: {
          endpoints: {
            default: {
              url: `${program.https ? `https://` : `http://`}${program.host}:${
                program.proxyPort
              }/___graphql`,
            },
          },
        },
      },
      null,
      2
    )

    const outputPath = resolve(base, OUTPUT_PATHS.config)

    await fs.outputFile(outputPath, configJSONString)
    reporter.verbose(`Successfully created graphql.config.json`)
  } catch (err) {
    reporter.error(`Failed to write graphql.config.json`, err)
  }
}

export async function writeGraphQLFragments(
  directory: IStateProgram["directory"],
  store: GatsbyReduxStore
): Promise<void> {
  try {
    const currentDefinitions = store.getState().definitions

    const fragmentString = Array.from(currentDefinitions.entries())
      .filter(([_, def]) => def.isFragment)
      .map(([_, def]) => `# ${def.filePath}\n${def.printedAst}`)
      .join(`\n`)

    await fs.outputFile(join(directory, OUTPUT_PATHS.fragments), fragmentString)
    reporter.verbose(`Wrote fragments.graphql file to .cache`)
  } catch (err) {
    reporter.error(`Failed to write fragments.graphql to .cache`, err)
  }
}

export async function writeGraphQLSchema(
  directory: IStateProgram["directory"],
  store: GatsbyReduxStore
): Promise<void> {
  try {
    const { schema } = store.getState()
    const schemaSDLString = printSchema(stabilizeSchema(schema), {
      commentDescriptions: true,
    })

    await fs.outputFile(join(directory, OUTPUT_PATHS.schema), schemaSDLString)
    reporter.verbose(`Successfully created schema.graphql`)
  } catch (err) {
    reporter.error(`Failed to write schema.graphql to .cache`, err)
  }
}
