import type { MachineOptions } from "xstate"
import {
  customizeSchema,
  createPages,
  buildSchema,
  sourceNodes,
  writeOutRedirects as writeOutRedirectsAndWatch,
} from "../../services"
import type { IDataLayerContext } from "./types"

export const dataLayerServices: MachineOptions<
  IDataLayerContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>["services"] = {
  customizeSchema,
  sourceNodes,
  createPages,
  buildSchema,
  writeOutRedirectsAndWatch,
}
