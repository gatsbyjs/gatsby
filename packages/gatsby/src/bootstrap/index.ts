import { startRedirectListener } from "./redirects-writer"
import {
  IBuildContext,
  initialize,
  customizeSchema,
  sourceNodes,
  buildSchema,
  createPages,
  extractQueries,
  writeOutRedirects,
  postBootstrap,
  rebuildSchemaWithSitePage,
} from "../services"
import { Runner, createGraphQLRunner } from "./create-graphql-runner"
import reporter from "gatsby-cli/lib/reporter"
import { globalTracer } from "opentracing"
import type { GatsbyWorkerPool } from "../utils/worker/pool"
import { handleStalePageData } from "../utils/page-data"
import { saveStateForWorkers } from "../redux"

const tracer = globalTracer()

export async function bootstrap(
  initialContext: Partial<IBuildContext>
): Promise<{
  gatsbyNodeGraphQLFunction: Runner
  workerPool: GatsbyWorkerPool
}> {
  const spanArgs = initialContext.parentSpan
    ? { childOf: initialContext.parentSpan }
    : {}

  const parentSpan = tracer.startSpan(`bootstrap`, spanArgs)

  const bootstrapContext: IBuildContext & {
    shouldRunCreatePagesStatefully: boolean
  } = {
    ...initialContext,
    parentSpan,
    shouldRunCreatePagesStatefully: true,
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

  await handleStalePageData()

  await rebuildSchemaWithSitePage(context)

  saveStateForWorkers([`components`, `staticQueryComponents`])

  await extractQueries(context)

  await writeOutRedirects(context)

  startRedirectListener()

  await postBootstrap(context)

  parentSpan.finish()

  return {
    gatsbyNodeGraphQLFunction: context.gatsbyNodeGraphQLFunction,
    workerPool: context.workerPool,
  }
}
