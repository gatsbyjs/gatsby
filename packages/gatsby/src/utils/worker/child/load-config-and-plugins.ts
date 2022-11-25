import { loadConfig } from "../../../bootstrap/load-config"
import { loadPlugins } from "../../../bootstrap/load-plugins"
import { store } from "../../../redux"
import apiRunnerNode from "../../api-runner-node"

export async function loadConfigAndPlugins(
  ...args: Parameters<typeof loadConfig>
): Promise<void> {
  const [{ siteDirectory, program }] = args

  store.dispatch({
    type: `SET_PROGRAM`,
    payload: {
      ...program,
      directory: siteDirectory,
    },
  })
  const config = await loadConfig(...args)
  await loadPlugins(config, siteDirectory)

  // Cache is already initialized
  await apiRunnerNode(`onPluginInit`)
}
