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
  writeOutRedirects,
  postBootstrap,
  rebuildSchemaWithSitePage,
} from "../services"
import { createGraphQLRunner } from "./create-graphql-runner"
import reporter from "gatsby-cli/lib/reporter"
import { globalTracer } from "opentracing"
const tracer = globalTracer()

export async function bootstrap(
  initialContext: Partial<IBuildContext>
): Promise<
  Required<
    Pick<IBuildContext, "store" | "gatsbyNodeGraphQLFunction" | "workerPool">
  >
> {
  const spanArgs = initialContext.parentSpan
    ? { childOf: initialContext.parentSpan }
    : {}

  initialContext.parentSpan = tracer.startSpan(`bootstrap`, spanArgs)

  const bootstrapContext = {
    ...initialContext,
    ...(await initialize(initialContext)),
  }

  await customizeSchema(bootstrapContext)
  await sourceNodes(bootstrapContext)

  await buildSchema(bootstrapContext)

  const context = {
    ...bootstrapContext,
    gatsbyNodeGraphQLFunction: createGraphQLRunner(
      bootstrapContext.store,
      reporter
    ),
  }

  await createPages(context)

  await createPagesStatefully(context)

  await rebuildSchemaWithSitePage(context)

  await extractQueries(context)

  await writeOutRequires(context)

  await writeOutRedirects(context)

  startRedirectListener()

  await postBootstrap(context)

  initialContext.parentSpan.finish()

  return context
}
