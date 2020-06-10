import { startRedirectListener } from "./redirects-writer"
import {
  IBuildContext,
  initialize,
  customizeSchema,
  sourceNodes,
  buildSchema,
  writeOutRequires,
  createPages,
  createPagesStatefully,
  extractQueries,
} from "../services"
import { Runner } from "./create-graphql-runner"
import { writeOutRedirects } from "../services/write-out-redirects"
import { postBootstrap } from "../services/post-bootstrap"

export async function bootstrap(
  context: IBuildContext
): Promise<{ bootstrapGraphQLFunction: Runner }> {
  const currentContext: IBuildContext = {
    ...context,
    ...(await initialize(context)),
  }

  await customizeSchema(currentContext)
  await sourceNodes(currentContext)

  const { bootstrapGraphQLFunction } = await buildSchema(currentContext)

  currentContext.bootstrapGraphQLFunction = bootstrapGraphQLFunction

  await createPages(currentContext)

  await createPagesStatefully(currentContext)

  await extractQueries(currentContext)

  await writeOutRequires(currentContext)

  await writeOutRedirects(currentContext)

  startRedirectListener()

  await postBootstrap(currentContext)

  return { bootstrapGraphQLFunction }
}
