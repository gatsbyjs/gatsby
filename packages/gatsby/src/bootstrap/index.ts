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
import { rebuildWithSitePage } from "../schema"

export async function bootstrap(
  initialContext: IBuildContext
): Promise<{ bootstrapGraphQLFunction: Runner }> {
  const context: IBuildContext = {
    ...initialContext,
    ...(await initialize(initialContext)),
  }

  await customizeSchema(context)
  await sourceNodes(context)

  const { bootstrapGraphQLFunction } = await buildSchema(context)

  context.bootstrapGraphQLFunction = bootstrapGraphQLFunction

  await createPages(context)

  await createPagesStatefully(context)

  await rebuildWithSitePage(context)

  await extractQueries(context)

  await writeOutRequires(context)

  await writeOutRedirects(context)

  startRedirectListener()

  await postBootstrap(context)

  return { bootstrapGraphQLFunction }
}
