import path from "path"
import { interpret } from "xstate"
import { Kind } from "graphql"
import type { GatsbyNode } from "gatsby"
import { typegenMachine } from "./internal/machine"
import { makeEmitSchemaService } from "./services/emit-schema"
import { makeEmitPluginDocumentService } from "./services/emit-plugin-document"
import { makeCodegenService } from "./services/codegen"

let spawnedMachine: any = null

/*
  const {
    namespace = `GatsbyTypes`,
    autofix = true,
    emitSchema: emitSchemaOptionMap = {},
    emitPluginDocument: emitPluginDocumentsOptionMap = {},
    scalars = {},
  } = pluginOptions

  language: `typescript`,
    namespace,
    outputPath,
    autofix,
    emitSchema,
    emitPluginDocument,
    scalars,

    const outputPath = path.resolve(basePath, `.cache/typegen/gatsby-types.d.ts`)
    */

export const onPreBootstrap: GatsbyNode["onPreBootstrap"] = ({
  store,
  emitter,
  reporter,
}) => {
  const { program } = store.getState()
  const basePath = program.directory
  const SCHEMA_OUTPUT_PATH = path.resolve(
    basePath,
    `.cache/typegen/gatsby-schema.graphql`
  )
  const TYPES_OUTPUT_PATH = path.resolve(
    basePath,
    `.cache/typegen/gatsby-types.d.ts`
  )
  const DOCUMENTS_OUTPUT_PATH = path.resolve(
    basePath,
    `.cache/typegen/gatsby-documents.graphql`
  )

  const emitSchema = makeEmitSchemaService({
    filePath: SCHEMA_OUTPUT_PATH,
  })

  const emitPluginDocument = makeEmitPluginDocumentService({
    filePath: DOCUMENTS_OUTPUT_PATH,
  })

  const codegen = makeCodegenService({
    namespace: `InternalGatsbyTypes`,
    outputPath: TYPES_OUTPUT_PATH,
  })

  const typegenService = interpret(
    typegenMachine
      .withContext({
        debouncingDelay: 500,
        devMode: false,
      })
      .withConfig({
        actions: {
          reportEmitSchemaError: (_context, event) => {
            reporter.error(
              `error occurred while running emitSchema service`,
              // @ts-ignore - FIXME
              event.data as Error
            )
          },
          reportEmitPluginDocumentError: (_context, event) => {
            reporter.error(
              `error occurred while running emitPluginDocument service`,
              // @ts-ignore - FIXME
              event.data as Error
            )
          },
          reportCodegenError: (_context, event) => {
            reporter.error(
              `error occurred while running codegen service`,
              // @ts-ignore - FIXME
              event.data as Error
            )
          },
        },
        services: {
          emitSchema: context => emitSchema(context.schema!),
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore for typegen bug
          emitPluginDocument: context =>
            emitPluginDocument(context.thirdpartyFragments || []),
          codegen: context =>
            codegen({
              schema: context.schema!,
              documents: [...(context.trackedDefinitions?.values() || [])].map(
                definitionMeta => {
                  return {
                    document: {
                      kind: Kind.DOCUMENT,
                      definitions: [definitionMeta.def],
                    },
                    hash: definitionMeta.hash.toString(),
                  }
                }
              ),
            }),
        },
      })
  )

  typegenService.start()

  typegenService.onTransition(({ event, value, changed }) => {
    reporter.verbose(`on ${event.type}`)
    if (changed) {
      reporter.verbose(` ⤷ transition to ${JSON.stringify(value)}`)
    } else {
      reporter.verbose(` ⤷ skipped`)
    }
  })

  spawnedMachine = typegenService

  emitter.on(`SET_SCHEMA`, () => {
    typegenService.send({ type: `SET_SCHEMA`, schema: store.getState().schema })
  })

  emitter.on(`SET_GRAPHQL_DEFINITIONS`, () => {
    typegenService.send({
      type: `SET_GRAPHQL_DEFINITIONS`,
      definitions: store.getState().definitions,
    })
  })
}

export const onCreateDevServer: GatsbyNode["onCreateDevServer"] = () => {
  spawnedMachine?.send(`CREATE_DEV_SERVER`)
}
