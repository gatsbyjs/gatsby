export interface ActivityTracker {
  start(): Function
  end(): Function
  setStatus(status: string): Function
  span: Object
}

export interface ActivityArgs {
  parentSpan?: Object
}

type LogMessageType = (format: string, ...args: any[]) => void

export interface Reporter {
  stripIndent: Function
  format: Object
  setVerbose(isVerbose: boolean): void
  setNoColor(isNoColor: boolean): void
  panic(...args: any[]): void
  panicOnBuild(...args: any[]): void
  error(errorMeta: string | Object, error?: Object): void
  uptime(prefix: string): void
  success: LogMessageType
  verbose: LogMessageType
  info: LogMessageType
  warn: LogMessageType
  log: LogMessageType
  activityTimer(name: string, activityArgs: ActivityArgs): ActivityTracker
}
