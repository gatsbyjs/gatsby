import { IProgram } from "./types"

module.exports = async (program: IProgram): Promise<void> => {
  if (process.env.GATSBY_EXPERIMENTAL_STATE_MACHINE) {
    return require(`./develop-state-machine`)(program)
  }
  return require(`./develop-standard`)(program)
}
