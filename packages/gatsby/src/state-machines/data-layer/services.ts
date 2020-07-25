import { ServiceConfig } from "xstate"
import {
  customizeSchema,
  createPages,
  createPagesStatefully,
  buildSchema,
  sourceNodes,
  rebuildSchemaWithSitePage,
  writeOutRedirects as writeOutRedirectsAndWatch,
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
  rebuildSchemaWithSitePage,
  writeOutRedirectsAndWatch,
}
