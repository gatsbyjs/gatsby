import { IPreviewData } from "./../steps/preview/index";
import type { NodePluginArgs, Reporter } from "gatsby";
import type { Application } from "express";

export type GatsbyNodeApiHelpers = NodePluginArgs & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Joi?: any | undefined;
  webhookBody?: IPreviewData;
  page?:
    | {
        path: string;
        component: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        context: any;
        updatedAt: number;
      }
    | undefined;
  refetchAll?: boolean | undefined;
  app?: Application | undefined;
};
export type GatsbyHelpers = GatsbyNodeApiHelpers;
export type GatsbyReporter = Reporter;
