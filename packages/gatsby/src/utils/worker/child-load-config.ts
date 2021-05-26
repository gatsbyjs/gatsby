import { IWorkerRunAllContext } from "./types"
import { loadConfig as actuallyLoadConfig } from "../../bootstrap/load-config"
import { hydrateProgram } from "./shared-db"
import { store } from "../../redux"
import apiRunnerNode from "../api-runner-node"
import reporter from "gatsby-cli/lib/reporter"

export async function loadConfig(
  _context: IWorkerRunAllContext
): Promise<void> {
  console.log(`[loadConfig start] ${process.env.JEST_WORKER_ID}`)
  // we reuse program from main process
  hydrateProgram()

  const { program } = store.getState()

  await actuallyLoadConfig({
    program,
  })

  reporter.setVerbose(program.verbose)

  // gatsby-plugin-sharp captures `actions` in onPreBootstrap, so we do need to call it.
  // alternative would be adjusting gatsby-plugin-sharp not to rely on this but it's unclear
  // how to do this quickly that isn't even more hacky than what it currently does
  await apiRunnerNode(`onPreBootstrap`)
  console.log(`[loadConfig end] ${process.env.JEST_WORKER_ID}`)
}
