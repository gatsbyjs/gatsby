import { IStateProgram } from "../internal"
import { GatsbyReduxStore } from "../redux"
import {
  writeGraphQLFragments,
  writeGraphQLSchema,
} from "../utils/graphql-typegen/file-writes"
// import { writeTypeScriptTypes } from "../utils/graphql-typegen/ts-codegen"

export async function graphQLTypegen({
  program,
  store,
}: {
  program: IStateProgram
  store: GatsbyReduxStore
}): Promise<void> {
  const directory = program.directory
  await writeGraphQLSchema(directory, store)
  await writeGraphQLFragments(directory, store)
  // await writeTypeScriptTypes()
}
