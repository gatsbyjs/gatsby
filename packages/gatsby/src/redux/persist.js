import v8 from "v8"
import fs from "fs-extra"
import { IReduxState } from "./types"

const file = (): string => `${process.cwd()}/.cache/redux.state`

export const readFromCache = (): IReduxState =>
  v8.deserialize(fs.readFileSync(file()))

export const writeToCache = (contents: IReduxState): Promise<void> =>
  fs.writeFile(file(), v8.serialize(contents))
