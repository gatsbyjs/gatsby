import { startLogger } from "./start-logger"
import { patchConsole } from "./patch-console"
import { catchExitSignals } from "./catch-exit-signals"
import { reporter } from "./reporter"

// Boy, I'm going to regret this
if (process.argv[2] !== `develop`) {
  catchExitSignals()
}

startLogger()
patchConsole(reporter)

export default reporter
module.exports = reporter
