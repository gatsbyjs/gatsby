import { IPreviewData } from "./../steps/preview/index"
import type { NodePluginArgs, Reporter } from "gatsby"
export type GatsbyNodeApiHelpers = NodePluginArgs & {
  Joi?: any
  webhookBody?: IPreviewData
  page?: {
    path: string
    component: string
    context: any
    updatedAt: number
  }
}
export type GatsbyHelpers = GatsbyNodeApiHelpers
export type GatsbyReporter = Reporter
