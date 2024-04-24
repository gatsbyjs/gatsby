import { Actions, ActivityStatuses, ActivityTypes } from "../constants";
import {
  type IStructuredError,
  ErrorCategory,
} from "../../structured-errors/types";
import type { IRenderPageArgs } from "../types";

export type IGatsbyCLIState = {
  activities: {
    [id: string]: IActivity;
  };
  status: ActivityStatuses | "";
};

export type ActionsUnion =
  | ICreateLog
  | ISetStatus
  | IEndActivity
  | IPendingActivity
  | IStartActivity
  | ICancelActivity
  | IUpdateActivity
  | IActivityErrored
  | ISetLogs
  | IRenderPageTree;

export type IActivity = {
  startTime?: [number, number] | undefined;
  id: string;
  uuid: string;
  text: string;
  type: ActivityTypes;
  status: ActivityStatuses;
  statusText?: string | undefined;
  current?: number | undefined;
  total?: number | undefined;
  duration?: number | undefined;
  errored?: boolean | undefined;
};

export type ILog = {
  level: string;
  text: string | undefined;
  statusText: string | undefined;
  duration: number | undefined;
  group: string | undefined;
  code: string | undefined;
  type: string | undefined;
  category?: keyof typeof ErrorCategory | undefined;
  filePath: string | undefined;
  location: IStructuredError["location"] | undefined;
  docsUrl: string | undefined;
  context: string | undefined;
  activity_current: number | undefined;
  activity_total: number | undefined;
  activity_type: string | undefined;
  activity_uuid: string | undefined;
  timestamp: string;
  stack: IStructuredError["stack"] | undefined;
  pluginName: string | undefined;
};

export type ICreateLog = {
  type: Actions.Log;
  payload: ILog;
};

export type ISetStatus = {
  type: Actions.SetStatus;
  payload: ActivityStatuses | "";
};

export type IPendingActivity = {
  type: Actions.PendingActivity;
  payload: {
    id: string;
    type: ActivityTypes;
    status: ActivityStatuses;
    startTime?: [number, number] | undefined;
  };
};

export type IStartActivity = {
  type: Actions.StartActivity;
  payload: IActivity;
};

export type ICancelActivity = {
  type: Actions.CancelActivity;
  payload: {
    id: string;
    status: ActivityStatuses.Cancelled;
    duration: number;
    type: ActivityTypes;
  };
};

export type IEndActivity = {
  type: Actions.EndActivity;
  payload: {
    uuid: string;
    id: string;
    status: ActivityStatuses;
    duration: number;
    type: ActivityTypes;
  };
};

export type IUpdateActivity = {
  type: Actions.UpdateActivity;
  payload: {
    uuid: string;
    id: string;
    statusText?: string | undefined;
    total?: number | undefined;
    current?: number | undefined;
  };
};

export type IActivityErrored = {
  type: Actions.ActivityErrored;
  payload: {
    id: string;
  };
};

export type ISetLogs = {
  type: Actions.SetLogs;
  payload: IGatsbyCLIState;
};

export type IRenderPageTree = {
  type: Actions.RenderPageTree;
  payload: IRenderPageArgs;
};
