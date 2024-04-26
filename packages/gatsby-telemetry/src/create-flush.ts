import { isCI } from "gatsby-core-utils";
import { join } from "path";
import { fork, spawnSync } from "child_process";
import time, { TimeUnit } from "@turist/time";

export function createFlush(isTrackingEnabled: boolean): () => Promise<void> {
  return async function flush(): Promise<void> {
    if (!isTrackingEnabled) {
      return;
    }

    if (isCI()) {
      spawnSync(process.execPath, [join(__dirname, "send.js")], {
        // @ts-ignore No overload matches this call.
        // Overload 1 of 8, '(command: string, args: readonly string[], options: SpawnSyncOptionsWithStringEncoding): SpawnSyncReturns<string>', gave the following error.
        // Object literal may only specify known properties, and 'execArgv' does not exist in type 'SpawnSyncOptionsWithStringEncoding'.
        // Overload 2 of 8, '(command: string, args: readonly string[], options: SpawnSyncOptionsWithBufferEncoding): SpawnSyncReturns<Buffer>', gave the following error.
        // Object literal may only specify known properties, and 'execArgv' does not exist in type 'SpawnSyncOptionsWithBufferEncoding'.
        // Overload 3 of 8, '(command: string, args?: readonly string[] | undefined, options?: SpawnSyncOptions | undefined): SpawnSyncReturns<string | Buffer>', gave the following error.
        // Object literal may only specify known properties, and 'execArgv' does not exist in type 'SpawnSyncOptions'.ts(2769)
        execArgv: [],
        timeout: time(1, TimeUnit.Minute),
      });

      return;
    }
    // Submit events on background with out blocking the main process
    // nor relying on it's life cycle
    const forked = fork(join(__dirname, "send.js"), {
      detached: true,
      stdio: "ignore",
      execArgv: [],
    });

    forked.unref();
  };
}
