import { kebabCase } from "lodash"
import path from "path"
import { store } from "../redux"

export const generateComponentChunkName = (componentPath: string): string => {
  const program = store.getState().program
  let directory = `/`
  if (program && program.directory) {
    directory = program.directory
  }
  const name = path.relative(directory, componentPath)
  return `component---${kebabCase(name)}`
}
