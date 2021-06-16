import { loadConfigAndPlugins as internalLoadConfigAndPlugins } from "../../../bootstrap/load-config-and-plugins"

// this is just to drop return, as resulting config object can contain properties that can't be cloned
// f.e. functions used in plugin options
export async function loadConfigAndPlugins(
  ...args: Parameters<typeof internalLoadConfigAndPlugins>
): Promise<void> {
  await internalLoadConfigAndPlugins(...args)
}
