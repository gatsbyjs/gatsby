import { startRedirectListener } from "./redirects-writer"
import {
  IBuildContext,
  initialize,
  customizeSchema,
  sourceNodes,
  buildSchema,
  writeOutRequires,
} from "../services"
import { Runner } from "./create-graphql-runner"
import { writeOutRedirects } from "../services/write-out-redirects"
import { postBootstrap } from "../services/post-bootstrap"

export default async function bootstrap(
  context: IBuildContext
): Promise<{ graphqlRunner: Runner }> {
  const currentContext = { ...context, ...(await initialize(context)) }

  await customizeSchema(currentContext)
  await sourceNodes(currentContext)

  const { graphqlRunner } = await buildSchema(currentContext)

  currentContext.graphqlRunner = graphqlRunner

  await writeOutRequires(currentContext)

  await writeOutRedirects(currentContext)

  startRedirectListener()

  await postBootstrap(currentContext)

  return { graphqlRunner }
}
