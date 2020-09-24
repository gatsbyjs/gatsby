import { resolve, join } from "path"
import * as fs from "fs-extra"
import { GraphQLSchema, printSchema } from "gatsby/graphql"
import type { GatsbyReduxStore } from "gatsby/src/redux"
import type { IStateProgram } from "gatsby/src/internal"

export async function cacheGraphQLConfig(
  program: IStateProgram
): Promise<void> {
  try {
    const base = program.directory
    const configJSONString = JSON.stringify(
      {
        schema: resolve(base, `.cache/schema.graphql`),
        documents: [
          resolve(base, `src/**/**.{ts,js,tsx,jsx,esm}`),
          resolve(base, `.cache/fragments.graphql`),
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

    await fs.writeFile(
      resolve(base, `.cache`, `graphql.config.json`),
      configJSONString
    )
    console.log(`[gatsby-plugin-graphql-config] wrote config file to .cache`)
  } catch (err) {
    console.error(
      `[gatsby-plugin-graphql-config] failed to write config file to .cache`
    )
    console.error(err)
  }
}

export const createFragmentCacheHandler = (
  cacheDirectory: string,
  store: GatsbyReduxStore
) => async (): Promise<void> => {
  try {
    const currentDefinitions = store.getState().definitions
    const fragmentString = Array.from(currentDefinitions.entries())
      .filter(([_, def]) => def.isFragment)
      .map(([_, def]) => `# ${def.filePath}\n${def.printedAst}`)
      .join(`\n`)

    await fs.writeFile(
      join(cacheDirectory, `fragments.graphql`),
      fragmentString
    )

    console.log(`[gatsby-plugin-graphql-config] wrote fragments file to .cache`)
  } catch (err) {
    console.error(
      `[gatsby-plugin-graphql-config] failed writing fragments file to .cache`
    )
    console.error(err)
  }
}

export const cacheSchema = async (
  cacheDirectory: string,
  schema: GraphQLSchema
): Promise<void> => {
  try {
    console.log(`printing schema`)
    const schemaSDLString = printSchema(schema, { commentDescriptions: true })

    await fs.writeFile(join(cacheDirectory, `schema.graphql`), schemaSDLString)

    console.log(`[gatsby-plugin-graphql-config] wrote SDL file to .cache`)
  } catch (err) {
    console.error(
      `[gatsby-plugin-graphql-config] failed writing schema file to .cache`
    )
    console.error(err)
  }
}

export const createSchemaCacheHandler = (
  cacheDirectory: string,
  store: GatsbyReduxStore
) => async (): Promise<void> => {
  const { schema } = store.getState()
  await cacheSchema(cacheDirectory, schema)
}
