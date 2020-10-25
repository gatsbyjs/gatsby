/* @flow */
// Force Update - test

import { globalTracer, Span } from "opentracing"
import { DocumentNode } from "graphql"
import { store } from "../redux"
import { getNodesByType, getTypes } from "../redux/nodes"
import { createSchemaComposer } from "./schema-composer"
import { buildSchema, rebuildSchemaWithSitePage } from "./schema"
import { builtInFieldExtensions } from "./extensions"
import { builtInTypeDefinitions } from "./types/built-in-types"
import { TypeConflictReporter } from "./infer/type-conflict-reporter"
import { IGatsbyPlugin } from "../redux/types"
import { GraphQLFieldExtensionDefinition } from "./extensions"

interface IBuildSchemaSpan {
  parentSpan?: Span
  fullMetadataBuild?: boolean
}

interface IBuildMetadataTypes {
  types: Array<string>
}

const tracer = globalTracer()

const getAllTypeDefinitions = (): Array<
  | {
      typeOrTypeDef: DocumentNode
      plugin?: IGatsbyPlugin
    }
  | string
> => {
  const {
    schemaCustomization: { types },
  } = store.getState()

  const builtInTypes = builtInTypeDefinitions().map(typeDef => {
    return {
      typeOrTypeDef: typeDef,
      plugin: undefined,
    }
  })

  // Ensure that user-defined types are processed last
  return [
    ...builtInTypes,
    ...types.filter(
      type =>
        typeof type !== `string` &&
        type.plugin &&
        type.plugin.name !== `default-site-plugin`
    ),
    ...types.filter(
      type =>
        typeof type === `string` ||
        !type.plugin ||
        type.plugin.name === `default-site-plugin`
    ),
  ]
}

// TODO - Replace `any` with `builtInFieldExtensions` type once extensions\index.js is typed
const getAllFieldExtensions = (): GraphQLFieldExtensionDefinition & any => {
  const {
    schemaCustomization: { fieldExtensions: customFieldExtensions },
  } = store.getState()

  return {
    ...customFieldExtensions,
    ...builtInFieldExtensions,
  }
}

// Schema building requires metadata for type inference.
// Technically it means looping through all type nodes, analyzing node structure
// and then using this aggregated node structure in related GraphQL type.
// Actual logic for inference located in inferenceMetadata reducer and ./infer
// Here we just orchestrate the process via redux actions
const buildInferenceMetadata = ({
  types,
}: IBuildMetadataTypes): Promise<void> =>
  new Promise(resolve => {
    if (!types || !types.length) {
      resolve()
      return
    }
    const typeNames = [...types]
    // TODO: use async iterators when we switch to node>=10
    //  or better investigate if we can offload metadata building to worker/Jobs API
    //  and then feed the result into redux?
    const processNextType = (): void => {
      const typeName = typeNames.pop()
      store.dispatch({
        type: `BUILD_TYPE_METADATA`,
        payload: {
          typeName,
          nodes: getNodesByType(typeName ?? ``),
        },
      })
      if (typeNames.length > 0) {
        // Give event-loop a break
        setTimeout(processNextType, 0)
      } else {
        resolve()
      }
    }
    processNextType()
  })

export const build = async ({
  parentSpan,
  fullMetadataBuild = true,
}: IBuildSchemaSpan): Promise<void> => {
  const spanArgs = parentSpan ? { childOf: parentSpan } : {}
  const span = tracer.startSpan(`build schema`, spanArgs)

  if (fullMetadataBuild) {
    // Build metadata for type inference and start updating it incrementally
    // except for SitePage type: we rebuild it in rebuildWithSitePage anyway
    // so it makes little sense to update it incrementally
    // (and those updates may have significant performance overhead)
    await buildInferenceMetadata({ types: getTypes() })
    store.dispatch({ type: `START_INCREMENTAL_INFERENCE` })
    store.dispatch({ type: `DISABLE_TYPE_INFERENCE`, payload: [`SitePage`] })
  }

  const {
    schemaCustomization: { thirdPartySchemas, printConfig },
    inferenceMetadata,
    config: { mapping: typeMapping },
  } = store.getState()

  const typeConflictReporter = new TypeConflictReporter()

  const fieldExtensions = getAllFieldExtensions()
  const schemaComposer = createSchemaComposer({ fieldExtensions })
  const schema = await buildSchema({
    schemaComposer,
    types: getAllTypeDefinitions(),
    fieldExtensions,
    thirdPartySchemas,
    typeMapping,
    printConfig,
    typeConflictReporter,
    inferenceMetadata,
    parentSpan,
  })

  typeConflictReporter.printConflicts()

  store.dispatch({
    type: `SET_SCHEMA_COMPOSER`,
    payload: schemaComposer,
  })
  store.dispatch({
    type: `SET_SCHEMA`,
    payload: schema,
  })

  span.finish()
}

export const rebuild = async ({
  parentSpan,
}: IBuildSchemaSpan): Promise<void> =>
  await build({ parentSpan, fullMetadataBuild: false })

export const rebuildWithSitePage = async ({
  parentSpan,
}: IBuildSchemaSpan): Promise<void> => {
  const spanArgs = parentSpan ? { childOf: parentSpan } : {}
  const span = tracer.startSpan(
    `rebuild schema with SitePage context`,
    spanArgs
  )
  await buildInferenceMetadata({ types: [`SitePage`] })

  // Disabling incremental inference for SitePage after the initial build
  // as it has a significant performance cost for zero benefits.
  // The only benefit is that schema rebuilds when SitePage.context structure changes.
  // (one can just restart `develop` in this case)
  store.dispatch({ type: `DISABLE_TYPE_INFERENCE`, payload: [`SitePage`] })

  const {
    schemaCustomization: { composer: schemaComposer },
    config: { mapping: typeMapping },
    inferenceMetadata,
  } = store.getState()

  const typeConflictReporter = new TypeConflictReporter()

  const schema = await rebuildSchemaWithSitePage({
    schemaComposer,
    fieldExtensions: getAllFieldExtensions(),
    typeMapping,
    typeConflictReporter,
    inferenceMetadata,
    parentSpan,
  })

  typeConflictReporter.printConflicts()

  store.dispatch({
    type: `SET_SCHEMA_COMPOSER`,
    payload: schemaComposer,
  })
  store.dispatch({
    type: `SET_SCHEMA`,
    payload: schema,
  })

  span.finish()
}
