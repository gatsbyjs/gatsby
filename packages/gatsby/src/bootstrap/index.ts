import { startRedirectListener } from "./redirects-writer"
import {
  IBuildContext,
  initialize,
  customizeSchema,
  sourceNodes,
  buildSchema,
  createPages,
  createPagesStatefully,
  extractQueries,
  writeOutRedirects,
  postBootstrap,
  rebuildSchemaWithSitePage,
} from "../services"
import { Runner, createGraphQLRunner } from "./create-graphql-runner"
import reporter from "gatsby-cli/lib/reporter"
import { globalTracer } from "opentracing"
import JestWorker from "jest-worker"
const tracer = globalTracer()

export async function bootstrap(
  initialContext: IBuildContext
): Promise<{
  gatsbyNodeGraphQLFunction: Runner
  workerPool: JestWorker
}> {
  const spanArgs = initialContext.parentSpan
    ? { childOf: initialContext.parentSpan }
    : {}

  initialContext.parentSpan = tracer.startSpan(`bootstrap`, spanArgs)

  const context = {
    ...initialContext,
    ...(await initialize(initialContext)),
  }

  await customizeSchema(context)
  await sourceNodes(context)

  await buildSchema(context)

  context.gatsbyNodeGraphQLFunction = createGraphQLRunner(
    context.store,
    reporter
  )

  await createPages(context)

  await createPagesStatefully(context)

  await rebuildSchemaWithSitePage(context)

  await extractQueries(context)

  await writeOutRedirects(context)

  startRedirectListener()

  await postBootstrap(context)

  initialContext.parentSpan.finish()

  return {
    gatsbyNodeGraphQLFunction: context.gatsbyNodeGraphQLFunction,
    workerPool: context.workerPool,
  }
}
