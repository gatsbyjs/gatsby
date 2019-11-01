export const Actions = {
  LogAction: `LOG_ACTION`,
  SetStatus: `SET_STATUS`,
  Log: `LOG`,
  SetLogs: `SET_LOGS`,

  StartActivity: `ACTIVITY_START`,
  EndActivity: `ACTIVITY_END`,
  UpdateActivity: `ACTIVITY_UPDATE`,
  PendingActivity: `ACTIVITY_PENDING`,
  CancelActivity: `ACTIVITY_CANCEL`,
  ActivityErrored: `ACTIVITY_ERRORED`,
}

export const LogLevels = {
  Debug: `DEBUG`,
  Success: `SUCCESS`,
  Info: `INFO`,
  Warning: `WARNING`,
  Log: `LOG`,
  Error: `ERROR`,
}

export const ActivityLogLevels = {
  Success: `ACTIVITY_SUCCESS`,
  Failed: `ACTIVITY_FAILED`,
  Interrupted: `ACTIVITY_INTERRUPTED`,
}

export const ActivityStatuses = {
  InProgress: `IN_PROGRESS`,
  NotStarted: `NOT_STARTED`,
  Interrupted: `INTERRUPTED`,
  Failed: `FAILED`,
  Success: `SUCCESS`,
  Cancelled: `CANCELLED`,
}

export const ActivityTypes = {
  Spinner: `spinner`,
  Hidden: `hidden`,
  Progress: `progress`,
  Pending: `pending`,
}
