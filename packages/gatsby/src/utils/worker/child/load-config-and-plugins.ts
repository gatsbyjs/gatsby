import { loadConfigAndPlugins as internalLoadConfigAndPlugins } from "../../../bootstrap/load-config-and-plugins"
import { store } from "../../../redux"
import apiRunnerNode from "../../api-runner-node"

export async function loadConfigAndPlugins(
  ...args: Parameters<typeof internalLoadConfigAndPlugins>
): Promise<void> {
  const [{ siteDirectory }] = args

  store.dispatch({
    type: `SET_PROGRAM`,
    payload: {
      ...store.getState().program,
      directory: siteDirectory,
    },
  })
  await internalLoadConfigAndPlugins(...args)

  // Cache is already initialized
  await apiRunnerNode(`unstable_onPluginInit`)
}
