import { ActivityStatuses } from "./constants";
import { IStructuredError } from "./structured-errors/types";
import { ErrorMeta, IActivityArgs, IPhantomReporter, IProgressReporter, ITimerReporter } from "./types";
import { ICreateLog } from "./redux/types";
/**
 * Reporter module.
 * @module reporter
 */
export declare class Reporter {
    /**
     * Strip initial indentation template function.
     */
    stripIndent: import("common-tags").TemplateTag;
    format: import("chalk").Chalk & {
        supportsColor: import("chalk").ColorSupport;
    };
    /**
     * Toggle verbosity.
     */
    setVerbose: (_isVerbose?: boolean) => void;
    /**
     * Turn off colors in error output.
     */
    setNoColor: (isNoColor?: boolean) => void;
    /**
     * Log arguments and exit process with status 1.
     */
    panic: (errorMeta: ErrorMeta, error?: Error | Error[] | undefined) => never;
    panicOnBuild: (errorMeta: ErrorMeta, error?: Error | Error[] | undefined) => IStructuredError | IStructuredError[];
    error: (errorMeta: ErrorMeta | ErrorMeta[], error?: Error | Error[] | undefined) => IStructuredError | IStructuredError[];
    /**
     * Set prefix on uptime.
     */
    uptime: (prefix: string) => void;
    verbose: (text: string) => void;
    success: (text?: string | undefined) => ICreateLog;
    info: (text?: string | undefined) => ICreateLog;
    warn: (text?: string | undefined) => ICreateLog;
    log: (text?: string | undefined) => ICreateLog;
    pendingActivity: ({ id, status, }: {
        id: string;
        status?: ActivityStatuses | undefined;
    }) => (import("./redux/types").IPendingActivity | ((dispatch: import("redux").Dispatch<import("./redux/types").ISetStatus>) => void))[];
    completeActivity: (id: string, status?: ActivityStatuses) => void;
    /**
     * Time an activity.
     */
    activityTimer: (text: string, activityArgs?: IActivityArgs) => ITimerReporter;
    /**
     * Create an Activity that is not visible to the user
     *
     * During the lifecycle of the Gatsby process, sometimes we need to do some
     * async work and wait for it to complete. A typical example of this is a job.
     * This work should set the status of the process to `in progress` while running and
     * `complete` (or `failure`) when complete. Activities do just this! However, they
     * are visible to the user. So this function can be used to create a _hidden_ activity
     * that while not displayed in the CLI, still triggers a change in process status.
     */
    phantomActivity: (text: string, activityArgs?: IActivityArgs) => IPhantomReporter;
    /**
     * Create a progress bar for an activity
     */
    createProgress: (text: string, total?: number, start?: number, activityArgs?: IActivityArgs) => IProgressReporter;
    _setStage: () => void;
}
export declare const reporter: Reporter;
