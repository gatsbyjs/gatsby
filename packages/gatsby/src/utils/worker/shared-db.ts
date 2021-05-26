import { open, RootDatabase } from "lmdb-store"
import { IGatsbyState } from "../../redux/types"
import { store } from "../../redux"
import { omit } from "lodash"
import report from "gatsby-cli/lib/reporter"

let rootDb: RootDatabase | undefined

function getDB(): RootDatabase {
  if (!rootDb) {
    rootDb = open({
      name: `shared`,
      path: process.cwd() + `/.cache/data/shared`,
      compression: true, // do we want that here?

      // structuredClone needed for Set/Map
      // @ts-ignore structuredClone doesn't exist in types, but is passed to msgpackr
      structuredClone: true,
    })

    if (!process.env.JEST_WORKER_ID) {
      rootDb.clear()
    }
  }
  return rootDb
}

export function clear(): void {
  report.verbose(`clearing db`)
  getDB().clear()
}

export async function setProgram(
  program: IGatsbyState["program"]
): Promise<any> {
  return getDB().put(`program`, omit(program, [`report`, `setStore`]))
}

export function hydrateProgram(): void {
  const program = getDB().get(`program`)

  store.dispatch({
    type: `SET_PROGRAM`,
    payload: { ...program, setStore: (): void => {}, report },
  })
}

export async function setInferenceMetadata(
  inferenceMetadata: IGatsbyState["inferenceMetadata"]
): Promise<any> {
  return getDB().put(`inferenceMetadata`, inferenceMetadata)
}

export function hydrateInferenceMetadata(): void {
  const inferenceMetadata = getDB().get(`inferenceMetadata`)

  store.dispatch({
    type: `SET_INFERENCE_METADATA`,
    payload: inferenceMetadata,
  })
}

export async function setExtractedQueries(
  components: IGatsbyState["components"],
  staticQueryComponents: IGatsbyState["staticQueryComponents"]
): Promise<any> {
  return Promise.all([
    getDB().put(`components`, components),
    getDB().put(`staticQueryComponents`, staticQueryComponents),
  ])
}

export function hydrateExtractedQueries(): void {
  const components = getDB().get(`components`)
  const staticQueryComponents = getDB().get(`staticQueryComponents`)

  store.dispatch({
    type: `SET_EXTRACTED_QUERIES`,
    payload: {
      components,
      staticQueryComponents,
    },
  })
}
