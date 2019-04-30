// @flow

export type ActivityTracker = {
  start(): Function,
  end(): Function,
  setStatus(s: string): Function,
  span: Object,
}

export type ActivityArgs = {
  parentSpan?: Object,
}

export interface Reporter {
  stripIndent: any;
  format: any;
  setVerbose(isVerbose: boolean): mixed;
  setNoColor(isNoColor: boolean): mixed;
  panic(...args: any): mixed;
  panicOnBuild(...args: any): mixed;
  error(message: any, error?: any): mixed;
  uptime(prefix: string): any;
  success(s: string): Function;
  verbose(s: string): Function;
  info(s: string): Function;
  warn(s: string): Function;
  log(s: string): Function;
  activityTimer(name: string, activityArgs: ActivityArgs): ActivityTracker;
}
