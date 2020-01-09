import v8 from "v8"
import { readFileSync, writeFile } from "fs-extra"
import { IReduxState } from "./types"

const file = (): string => `${process.cwd()}/.cache/redux.state`

export const readFromCache = (): IReduxState =>
  v8.deserialize(readFileSync(file()))

export const writeToCache = (contents: IReduxState): Promise<void> =>
  writeFile(file(), v8.serialize(contents))
