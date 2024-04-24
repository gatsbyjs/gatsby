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
        // @ts-ignore
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
