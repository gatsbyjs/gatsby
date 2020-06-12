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
import { writeOutRedirects } from "../services/write-out-redirects"
import { postBootstrap } from "../services/post-bootstrap"
import { rebuildWithSitePage } from "../schema"

export async function bootstrap<T extends Partial<IBuildContext>>(
  initialContext: T
): Promise<
  T &
    Required<
      Pick<IBuildContext, "store" | "bootstrapGraphQLFunction" | "workerPool">
    >
> {
  const bootstrapContext = {
    ...initialContext,
    ...(await initialize(initialContext)),
  }

  await customizeSchema(bootstrapContext)
  await sourceNodes(bootstrapContext)

  const { bootstrapGraphQLFunction } = await buildSchema(bootstrapContext)

  const context = { ...bootstrapContext, bootstrapGraphQLFunction }

  await createPages(context)

  await createPagesStatefully(context)

  await rebuildWithSitePage(context)

  await extractQueries(context)

  await writeOutRequires(context)

  await writeOutRedirects(context)

  startRedirectListener()

  await postBootstrap(context)

  return context
}
