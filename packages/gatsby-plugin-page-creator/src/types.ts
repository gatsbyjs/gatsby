import type { Options as ISlugifyOptions } from "@sindresorhus/slugify";
import type { PluginOptions } from "gatsby";
import type { IPathIgnoreOptions } from "gatsby-page-utils";

export type IOptions = {
  path: string;
  pathCheck?: boolean | undefined;
  ignore?: IPathIgnoreOptions | string | Array<string> | null | undefined;
  slugify?: ISlugifyOptions | undefined;
} & PluginOptions;
