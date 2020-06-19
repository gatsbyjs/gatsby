import { startLogger } from "./start-logger"
import { patchConsole } from "./patch-console"
import { catchExitSignals } from "./catch-exit-signals"
import { reporter } from "./reporter"
import { setStore } from "./redux"
import { reducer } from "./redux/reducer"
import { IGatsbyCLIState } from "./redux/types"
import { IActivityArgs, IPhantomReporter, IProgressReporter } from "./types"

catchExitSignals()
startLogger()
patchConsole(reporter)

export { reporter }
export { setStore }
export const reduxLogReducer = reducer

// Types
export { IActivityArgs, IPhantomReporter, IProgressReporter, IGatsbyCLIState }
export type IGatsbyReporter = typeof reporter
