import execa, {
  type Options,
  type StdioOption,
  type ExecaChildProcess,
} from "execa";

const defaultSpawnArgs: Options<"utf8"> = {
  cwd: process.cwd(),
  stdio: "inherit",
};

export function setDefaultSpawnStdio(
  stdio:
    | "inherit"
    | "pipe"
    | "overlapped"
    | "ignore"
    | ReadonlyArray<StdioOption>
    | undefined,
): void {
  // @ts-ignore Cannot assign to 'stdio' because it is a read-only property.ts(2540)
  defaultSpawnArgs.stdio = stdio;
}

export async function promisifiedSpawn([cmd, args = [], spawnArgs = {}]: [
  string,
  Array<string>?,
  Options<"utf8">?,
]): Promise<ExecaChildProcess<string>> {
  const spawnOptions: Options<"utf8"> = {
    ...defaultSpawnArgs,
    ...spawnArgs,
  };
  try {
    return await execa.execa(cmd, args, spawnOptions);
  } catch (e) {
    if (spawnOptions.stdio === "ignore") {
      console.log(
        `\nCommand "${cmd} ${args.join(
          " ",
        )}" failed.\nTo see details of failed command, rerun "gatsby-dev" without "--quiet" or "-q" switch\n`,
      );
    }
    throw e;
  }
}
