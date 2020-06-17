import { startLogger } from "./start-logger"
import { patchConsole } from "./patch-console"
import { catchExitSignals } from "./catch-exit-signals"
import { reporter, Reporter } from "./reporter"
import { setStore } from "./redux"
import { reducer } from "./redux/reducer"
import { IActivityArgs, IPhantomReporter, IProgressReporter } from "./types"

catchExitSignals()
startLogger()
patchConsole(reporter)

export { reporter }
export { setStore }
export const reduxLogReducer = reducer

// Types
export { IActivityArgs, IPhantomReporter, IProgressReporter }
export type IReporter = typeof Reporter
