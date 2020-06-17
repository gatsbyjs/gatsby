import { startLogger } from "./start-logger"
import { patchConsole } from "./patch-console"
import { catchExitSignals } from "./catch-exit-signals"
import { reporter } from "./reporter"
import { setStore } from "./redux"
import { reducer } from "./redux/reducer"

catchExitSignals()
startLogger()
patchConsole(reporter)

export { reporter }
export { setStore }
export const reduxLogReducer = reducer
