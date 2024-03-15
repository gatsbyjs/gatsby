// "engines-fs-provider" must be first import, as it sets up global
// fs and this need to happen before anything else tries to import fs
import "../../utils/engines-fs-provider"
import "./platform-and-arch-check"

import { getCache as getGatsbyCache } from "../../utils/get-cache"

if (!global._polyfillRemoteFileCache) {
  global._polyfillRemoteFileCache = getGatsbyCache(`gatsby`)
}
