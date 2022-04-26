import reporter from "gatsby-cli/lib/reporter"
import { EventObject } from "xstate"
import { IBuildContext } from "../internal"
import {
  writeGraphQLFragments,
  writeGraphQLSchema,
} from "../utils/graphql-typegen/file-writes"
import { writeTypeScriptTypes } from "../utils/graphql-typegen/ts-codegen"

export async function graphQLTypegen(
  { program, store, parentSpan }: Partial<IBuildContext>,
  _: EventObject,
  {
    src: { compile },
  }: {
    src: { type: "graphQLTypegen"; compile: "all" | "schema" | "definitions" }
  }
): Promise<void> {
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

  if (compile === `all` || compile === `schema`) {
    await writeGraphQLSchema(directory, store)
    if (compile === `schema`) {
      reporter.verbose(`Re-Generate GraphQL Schema types`)
    }
  }
  if (compile === `all` || compile === `definitions`) {
    await writeGraphQLFragments(directory, store)
    await writeTypeScriptTypes(directory, store)
    if (compile === `definitions`) {
      reporter.verbose(`Re-Generate TypeScript types & GraphQL fragments`)
    }
  }

  activity.end()
}
