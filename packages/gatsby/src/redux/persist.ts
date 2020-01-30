import v8 from "v8"
import { readFileSync, writeFileSync } from "fs-extra"
import { ICachedReduxState } from "./types"

const file = (): string => `${process.cwd()}/.cache/redux.state`

export const readFromCache = (): ICachedReduxState =>
  v8.deserialize(readFileSync(file()))

export const writeToCache = (contents: ICachedReduxState): void => {
  writeFileSync(file(), v8.serialize(contents))
}
