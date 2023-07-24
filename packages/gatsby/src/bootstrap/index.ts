import reporter from "gatsby-cli/lib/reporter"
import { slash } from "gatsby-core-utils"
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
} from "../services"
import { Runner, createGraphQLRunner } from "./create-graphql-runner"
import { globalTracer } from "opentracing"
import type { GatsbyWorkerPool } from "../utils/worker/pool"
import { handleStalePageData } from "../utils/page-data"
import { savePartialStateToDisk } from "../redux"
import { IProgram } from "../commands/types"
import type { IAdapterManager } from "../utils/adapter/types"

const tracer = globalTracer()

export async function bootstrap(
  initialContext: Partial<IBuildContext> & { program: IProgram }
): Promise<{
  gatsbyNodeGraphQLFunction: Runner
  workerPool: GatsbyWorkerPool
  adapterManager?: IAdapterManager
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

  const workerPool = context.workerPool

  const program = context.store.getState().program
  const directory = slash(program.directory)

  workerPool.all.loadConfigAndPlugins({ siteDirectory: directory, program })

  await customizeSchema(context)
  await sourceNodes(context)

  await buildSchema(context)

  context.gatsbyNodeGraphQLFunction = createGraphQLRunner(
    context.store,
    reporter
  )

  await createPages(context)

  await handleStalePageData(parentSpan)

  savePartialStateToDisk([`inferenceMetadata`])

  workerPool.all.buildSchema()

  await extractQueries(context)

  savePartialStateToDisk([`components`, `staticQueryComponents`])

  await writeOutRedirects(context)

  startRedirectListener()

  await postBootstrap(context)

  parentSpan.finish()

  return {
    gatsbyNodeGraphQLFunction: context.gatsbyNodeGraphQLFunction,
    workerPool,
    adapterManager: context.adapterManager,
  }
}
