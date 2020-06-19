import { Dispatch } from "redux";
export declare const createLog: ({ level, text, statusText, duration, group, code, type, filePath, location, docsUrl, context, activity_current, activity_total, activity_type, activity_uuid, stack, }: {
    level: string;
    text?: string | undefined;
    statusText?: string | undefined;
    duration?: number | undefined;
    group?: string | undefined;
    code?: string | undefined;
    type?: string | undefined;
    filePath?: string | undefined;
    location?: {
        start: import("../structured-errors/types").ILocationPosition;
        end?: import("../structured-errors/types").ILocationPosition | undefined;
    } | undefined;
    docsUrl?: string | undefined;
    context?: string | undefined;
    activity_current?: number | undefined;
    activity_total?: number | undefined;
    activity_type?: string | undefined;
    activity_uuid?: string | undefined;
    stack?: import("../structured-errors/types").IStructuredStackFrame[] | undefined;
}) => import("./types").ICreateLog;
export declare const createPendingActivity: ({ id, status, }: {
    id: string;
    status?: import("../constants").ActivityStatuses | undefined;
}) => (import("./types").IPendingActivity | ((dispatch: Dispatch<import("./types").ISetStatus>) => void))[];
export declare const setStatus: (status: "" | import("../constants").ActivityStatuses, force?: boolean) => (dispatch: Dispatch<import("./types").ISetStatus>) => void;
export declare const startActivity: ({ id, text, type, status, current, total, }: {
    id: string;
    text: string;
    type: import("../constants").ActivityTypes;
    status?: import("../constants").ActivityStatuses | undefined;
    current?: number | undefined;
    total?: number | undefined;
}) => (import("./types").IStartActivity | ((dispatch: Dispatch<import("./types").ISetStatus>) => void))[];
export declare const endActivity: ({ id, status, }: {
    id: string;
    status: import("../constants").ActivityStatuses;
}) => (import("./types").ICreateLog | import("./types").IEndActivity | import("./types").ICancelActivity | ((dispatch: Dispatch<import("./types").ISetStatus>) => void))[] | null;
export declare const updateActivity: ({ id, ...rest }: {
    id: string;
    statusText?: string | undefined;
    total?: number | undefined;
    current?: number | undefined;
}) => import("./types").IUpdateActivity | null;
export declare const setActivityErrored: ({ id, }: {
    id: string;
}) => import("./types").IActivityErrored | null;
export declare const setActivityStatusText: ({ id, statusText, }: {
    id: string;
    statusText: string;
}) => import("./types").IUpdateActivity | null;
export declare const setActivityTotal: ({ id, total, }: {
    id: string;
    total: number;
}) => import("./types").IUpdateActivity | null;
export declare const activityTick: ({ id, increment, }: {
    id: string;
    increment: number;
}) => import("./types").IUpdateActivity | null;
