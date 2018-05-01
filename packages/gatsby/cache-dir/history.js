import createHistory from "history/createBrowserHistory"
import { apiRunner } from "./api-runner-browser"

let pathPrefix = `/`
if (__PREFIX_PATHS__) {
  pathPrefix = `${__PATH_PREFIX__}/`
}
const basename = pathPrefix.slice(0, -1)

const pluginResponses = apiRunner(`replaceHistory`, { basename })
const replacementHistory = pluginResponses[0]

const history = replacementHistory || createHistory({ basename })
export default history
