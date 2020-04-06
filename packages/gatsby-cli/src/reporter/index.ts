import { startLogger } from './start-logger';
import { patchConsole } from './patch-console'
import { catchExitSignals } from './short-circut'
import { reporter } from './reporter'

catchExitSignals();
startLogger();
patchConsole(reporter)

export * as reporter from './reporter'
export default reporter