import { loadConfigAndPlugins as internalLoadConfigAndPlugins } from "../../../bootstrap/load-config-and-plugins"
import { store } from "../../../redux"
import apiRunnerNode from "../../api-runner-node"

export async function loadConfigAndPlugins(
  ...args: Parameters<typeof internalLoadConfigAndPlugins>
): Promise<void> {
  const [{ siteDirectory, program }] = args

  store.dispatch({
    type: `SET_PROGRAM`,
    payload: {
      ...program,
      directory: siteDirectory,
    },
  })
  await internalLoadConfigAndPlugins(...args)

  // Cache is already initialized
  if (_CFLAGS_.GATSBY_MAJOR === `4`) {
    await apiRunnerNode(`onPluginInit`)
  } else {
    await apiRunnerNode(`unstable_onPluginInit`)
  }
}
