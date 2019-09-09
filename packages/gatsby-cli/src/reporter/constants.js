export const Actions = {
  Version: `VERSION`,
  LogAction: `LOG_ACTION`,
  SetStatus: `SET_STATUS`,
  Log: `LOG`,
  StatefulLog: `STATEFUL_LOG`,
  ClearStatefulLog: `CLEAR_STATEFUL_LOG`,
  SetLogs: `SET_LOGS`,
}

export const LogLevels = {
  Debug: `DEBUG`,
  Success: `SUCCESS`,
  Info: `INFO`,
  Warning: `WARNING`,
  Log: `LOG`,
  Error: `ERROR`,
}

// TODO: These should be actions but are used as log levels as well
// so this needs to be cleaned up across the board
export const ActivityLogLevels = {
  Start: `ACTIVITY_START`,
  Success: `ACTIVITY_SUCCESS`,
  Pending: `ACTIVITY_PENDING`,
  Failed: `ACTIVITY_FAILED`,
  Interrupted: `ACTIVITY_INTERRUPTED`,
  Cancel: `ACTIVITY_CANCEL`,
  End: `ACTIVITY_END`,
  Update: `ACTIVITY_UPDATE`,
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
