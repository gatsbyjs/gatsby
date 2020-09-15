import * as fs from "fs-extra"
import * as path from "path"
import { printSchema, GraphQLSchema } from "graphql"
import { IDefinitionMeta } from "gatsby/src/internal"

export function onPostBootstrap({ store }): void {
  const {
    schema,
    program,
  }: {
    schema: GraphQLSchema
    program: { directory: string }
  } = store.getState()

  const cacheDirectory = path.join(program.directory, `.cache`)
  if (!fs.existsSync(cacheDirectory)) {
    return
  }
  try {
    const schemaSDLString = printSchema(schema, { commentDescriptions: true })
    fs.writeFileSync(
      path.join(cacheDirectory, `schema.graphql`),
      schemaSDLString
    )
    console.log(`[gatsby-plugin-graphql-cache] wrote SDL file to .cache`)
  } catch (err) {
    console.error(`[gatsby-plugin-graphql-cache] failed writing SDL file`)
    console.error(err)
  }
  try {
    let previousSize = 0
    function handleChangeDefinitions(): void {
      const currentDefinitions: Map<string, IDefinitionMeta> = store.getState()
        .definitions
      if (
        (currentDefinitions.size > 0 && previousSize === 0) ||
        previousSize !== currentDefinitions.size
      ) {
        const fragmentString = Array.from(currentDefinitions.entries())
          .filter(([_, def]) => def.isFragment)
          .map(([_, def]) => `# ${def.filePath}\n${def.printedAst}`)
          .join(`\n`)
        fs.writeFileSync(
          path.join(cacheDirectory, `fragments.graphql`),
          fragmentString
        )
        previousSize = currentDefinitions.size
        console.log(
          `[gatsby-plugin-graphql-cache] wrote fragments file to .cache`
        )
      }
    }
    store.subscribe(handleChangeDefinitions)
  } catch (err) {
    console.error(`[gatsby-plugin-graphql-cache] failed writing fragments file`)
  }
}
