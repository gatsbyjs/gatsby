import createHistory from "history/createBrowserHistory"
import { apiRunner } from "./api-runner-browser"

const pluginResponses = apiRunner(`replaceHistory`)
const replacementHistory = pluginResponses[0]
const history = replacementHistory || createHistory()
export default history
