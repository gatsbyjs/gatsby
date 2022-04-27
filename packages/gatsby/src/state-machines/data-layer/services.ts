import { ServiceConfig } from "xstate"
import {
  customizeSchema,
  createPages,
  buildSchema,
  sourceNodes,
  writeOutRedirects as writeOutRedirectsAndWatch,
  graphQLTypegen,
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
  writeOutRedirectsAndWatch,
  // @ts-ignore - No clue how to fix this
  graphQLTypegen,
}
