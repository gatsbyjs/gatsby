import { ServiceConfig } from "xstate"
import {
  customizeSchema,
  createPages,
  createPagesStatefully,
  buildSchema,
  sourceNodes,
} from "../../services"
import { IDataLayerContext } from "./types"

export const dataLayerServices: Record<
  string,
  ServiceConfig<IDataLayerContext>
> = {
  customizeSchema,
  sourceNodes,
  createPages,
  buildSchema,
  createPagesStatefully,
}
