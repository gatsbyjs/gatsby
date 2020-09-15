import * as fs from "fs-extra"
import { resolve, join } from "path"
import { printSchema, GraphQLSchema } from "graphql"
import type { GatsbyReduxStore } from "gatsby/src/redux"
import type { IStateProgram } from "gatsby/src/internal"

async function cacheSchema(
  cacheDirectory: string,
  schema: GraphQLSchema
): Promise<void> {
  try {
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

async function cacheGraphQLConfig(program: IStateProgram): Promise<void> {
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

    fs.writeFileSync(
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

const createFragmentCacheHandler = (
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

export async function onPostBootstrap({
  store,
  emitter,
}: {
  store: GatsbyReduxStore
  emitter: any
}): Promise<void> {
  const { schema, program } = store.getState()

  const cacheDirectory = resolve(program.directory, `.cache`)

  if (!fs.existsSync(cacheDirectory)) {
    return
  }

  await cacheSchema(cacheDirectory, schema)

  await cacheGraphQLConfig(program)

  emitter.on(
    `SET_DEFINITIONS`,
    createFragmentCacheHandler(cacheDirectory, store)
  )
}
