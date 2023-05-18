import type reporter from "gatsby-cli/lib/reporter"

export interface IAdapter {
  cache?: {
    restore: (
      directories: Array<string>
    ) => Promise<boolean | void> | boolean | void
    store: (directories: Array<string>) => Promise<void> | void
  }
}

export type IAdapterCtor = (args: { reporter: typeof reporter }) => IAdapter
