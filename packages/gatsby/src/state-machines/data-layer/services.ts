import { MachineOptions } from "xstate"
import {
  customizeSchema,
  createPages,
  buildSchema,
  sourceNodes,
  writeOutRedirects as writeOutRedirectsAndWatch,
} from "../../services"
import { IDataLayerContext } from "./types"

export const dataLayerServices: MachineOptions<
  IDataLayerContext,
  any
>["services"] = {
  customizeSchema,
  sourceNodes,
  createPages,
  buildSchema,
  writeOutRedirectsAndWatch,
}
