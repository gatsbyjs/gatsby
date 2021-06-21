import { loadConfigAndPlugins as internalLoadConfigAndPlugins } from "../../../bootstrap/load-config-and-plugins"
import { store } from "../../../redux"
// this is just to drop return, as resulting config object can contain properties that can't be cloned
// e.g. functions used in plugin options
export async function loadConfigAndPlugins(
  ...args: Parameters<typeof internalLoadConfigAndPlugins>
): Promise<void> {
  const [{ siteDirectory }] = args

  store.dispatch({
    type: `SET_PROGRAM`,
    payload: {
      directory: siteDirectory,
    },
  })
  await internalLoadConfigAndPlugins(...args)
}
