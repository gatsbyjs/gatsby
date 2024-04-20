import { type Options, type StdioOption, type ExecaChildProcess } from "execa";
export declare function setDefaultSpawnStdio(stdio: "inherit" | "pipe" | "overlapped" | "ignore" | ReadonlyArray<StdioOption> | undefined): void;
export declare function promisifiedSpawn([cmd, args, spawnArgs]: [
    string,
    Array<string>?,
    Options<"utf8">?
]): Promise<ExecaChildProcess<string>>;
