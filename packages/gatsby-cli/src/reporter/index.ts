import { startLogger } from "./start-logger"
import { patchConsole } from "./patch-console"
import { catchExitSignals } from "./catch-exit-signals"
import { reporter } from "./reporter"

catchExitSignals()
startLogger()
patchConsole(reporter)

export default reporter
module.exports = reporter
