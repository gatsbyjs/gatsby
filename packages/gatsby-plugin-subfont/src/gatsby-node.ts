import { GatsbyNode, PluginOptions } from "gatsby"
import path from 'path';
import subfont from 'subfont';

export interface SubfontPluginOption extends PluginOptions {
  output?: string;
  debug?: boolean;
  dryRun?: boolean;
  silent?: boolean;
  inlineCss?: boolean;
  fontDisplay?: "auto" | "block" | "swap" | "fallback" | "optional";
  formats: Array<"woff2" | "woff" | "truetype">;
  inPlace?: boolean;
  recursive?: boolean;
  relativeUrls?: boolean;
  fallbacks?: boolean;
  dynamics?: boolean;
  browsers?: string[];
}

const onPostBuild: GatsbyNode['onPostBuild'] = async ({ store, reporter }, options: SubfontPluginOption) => {
  const root = path.join(store.getState().program.directory, `public`)
  const subfontConsole = {
    log: reporter.info,
    warn: reporter.warn,
    error: reporter.error,
  }

  await subfont(
    {
      root,
      inPlace: true,
      inlineCss: true,
      ...options,
    },
    subfontConsole
  )
}

export default { onPostBuild };