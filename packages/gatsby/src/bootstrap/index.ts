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
import { handleStalePageData } from "../utils/page-data"

const tracer = globalTracer()

export async function bootstrap(
  initialContext: Partial<IBuildContext>
): Promise<{
  gatsbyNodeGraphQLFunction: Runner
  workerPool: JestWorker
}> {
  const spanArgs = initialContext.parentSpan
    ? { childOf: initialContext.parentSpan }
    : {}

  const parentSpan = tracer.startSpan(`bootstrap`, spanArgs)

  const bootstrapContext: IBuildContext = {
    ...initialContext,
    parentSpan,
  }

  const context = {
    ...bootstrapContext,
    ...(await initialize(bootstrapContext)),
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

  await handleStalePageData()

  await rebuildSchemaWithSitePage(context)

  await extractQueries(context)

  // just exit at this point, no need to start running queries etc
  process.exit(0)

  await writeOutRedirects(context)

  startRedirectListener()

  await postBootstrap(context)

  parentSpan.finish()

  return {
    gatsbyNodeGraphQLFunction: context.gatsbyNodeGraphQLFunction,
    workerPool: context.workerPool,
  }
}
