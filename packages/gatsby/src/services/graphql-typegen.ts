import reporter from "gatsby-cli/lib/reporter"
import { IBuildContext } from "../internal"
import {
  writeGraphQLFragments,
  writeGraphQLSchema,
} from "../utils/graphql-typegen/file-writes"
import { writeTypeScriptTypes } from "../utils/graphql-typegen/ts-codegen"

export async function graphQLTypegen({
  program,
  store,
  parentSpan,
}: Partial<IBuildContext>): Promise<void> {
  if (!program || !store) {
    reporter.panic(`Missing required params "program" or "store"`)
  }
  const directory = program.directory

  const activity = reporter.activityTimer(
    `Generating GraphQL and TypeScript types`,
    {
      parentSpan,
    }
  )
  activity.start()

  await writeGraphQLSchema(directory, store)
  await writeGraphQLFragments(directory, store)
  await writeTypeScriptTypes(directory, store)

  activity.end()
}
