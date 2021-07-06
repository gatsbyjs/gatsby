import { loadConfigAndPlugins as internalLoadConfigAndPlugins } from "../../../bootstrap/load-config-and-plugins"
import { store } from "../../../redux"

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
}
