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
  reporter,
}: IBuildContext): Promise<void> {
  // TypeScript requires null/undefined checks for these
  // But this should never happen unless e.g. the state machine doesn't receive this information from a parent state machine
  if (!program || !store || !reporter) {
    throw new Error(
      `Missing required params in graphQLTypegen. program: ${!!program}. store: ${!!store}.`
    )
  }
  const directory = program.directory

  const activity = reporter.activityTimer(
    `Generating GraphQL and TypeScript types`,
    {
      parentSpan,
    }
  )
  activity.start()

  const { schema, definitions, config } = store.getState()
  const graphqlTypegenOptions = config.graphqlTypegen

  if (!graphqlTypegenOptions) {
    throw new Error(`graphqlTypegen option is falsy. This should never happen.`)
  }

  try {
    await writeGraphQLSchema(directory, schema)
    await writeGraphQLFragments(directory, definitions)
    await writeTypeScriptTypes(
      directory,
      schema,
      definitions,
      graphqlTypegenOptions
    )
  } catch (err) {
    activity.panicOnBuild({
      id: `12100`,
      context: {
        sourceMessage: err,
      },
    })
  }

  activity.end()
}
