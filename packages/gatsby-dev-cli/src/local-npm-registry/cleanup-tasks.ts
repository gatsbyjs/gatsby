import signalExit from "signal-exit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cleanupTasks = new Set<() => any>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerCleanupTask(taskFn: () => any) {
  cleanupTasks.add(taskFn);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (): any => {
    const result = taskFn();
    cleanupTasks.delete(taskFn);
    return result;
  };
}

signalExit.onExit(() => {
  if (cleanupTasks.size) {
    console.log("Process exitted in middle of publishing - cleaning up");
    cleanupTasks.forEach((taskFn) => taskFn());
  }
});
