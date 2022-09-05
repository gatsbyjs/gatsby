// "engines-fs-provider" must be first import, as it sets up global
// fs and this need to happen before anything else tries to import fs
import "../../utils/engines-fs-provider"

import { getCache as getGatsbyCache } from "../../utils/get-cache"

if (!global.polyfill_remote_file_cache) {
  global.polyfill_remote_file_cache = getGatsbyCache(`gatsby`)
}
