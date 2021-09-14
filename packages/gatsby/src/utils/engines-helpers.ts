import { emitter } from "../redux"
import { ICreatePageAction } from "../redux/types"

export function shouldPrintEngineSnapshot(): boolean {
  return process.env.gatsby_executing_command === `build`
}

let generate = false
export function shouldGenerateEngines(): boolean {
  return process.env.gatsby_executing_command === `build` && generate
}

emitter.on(`CREATE_PAGE`, (action: ICreatePageAction) => {
  if (action.payload.mode !== `SSG`) generate = true
})
