import v8 from "v8"
import { readFileSync, writeFileSync } from "fs-extra"
import { IReduxState } from "./types"

const file = (): string => `${process.cwd()}/.cache/redux.state`

export const readFromCache = (): IReduxState =>
  v8.deserialize(readFileSync(file()))

export const writeToCache = (contents: IReduxState): void => {
  writeFileSync(file(), v8.serialize(contents))
}
