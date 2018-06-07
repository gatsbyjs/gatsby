import createHistory from "history/createBrowserHistory"
import { apiRunner } from "./api-runner-browser"

const basename = __PATH_PREFIX__

const pluginResponses = apiRunner(`replaceHistory`, { basename })
const replacementHistory = pluginResponses[0]

const history = replacementHistory || createHistory({ basename })
export default history
