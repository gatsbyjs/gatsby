import apiRunnerNode from "../api-runner-node"

import { build } from "../../schema"

import { hydrateInferenceMetadata, hydrateExtractedQueries } from "./shared-db"
import { IWorkerRunAllContext } from "./types"

export async function buildSchema(
  _context: IWorkerRunAllContext
): Promise<void> {
  // console.log(`[buildSchema start] ${process.env.JEST_WORKER_ID}`)
  // we reuse inference metadata from main process to avoid inferring again
  hydrateInferenceMetadata()

  // need to call createSchemaCustomization as that doesn't happen inside schema building (as opposed to `createResolvers` and `setFieldsOnGraphQLNodeType`)
  await apiRunnerNode(`createSchemaCustomization`)

  // we will have inference metadata from main process
  await build({ fullMetadataBuild: false })

  // console.log(`[buildSchema end] ${process.env.JEST_WORKER_ID}`)
}

export async function setExtractedQueries(
  _context: IWorkerRunAllContext
): Promise<void> {
  // console.log(`[setExtractedQueries start] ${process.env.JEST_WORKER_ID}`)
  hydrateExtractedQueries()
  // console.log(`[setExtractedQueries end] ${process.env.JEST_WORKER_ID}`)
}
