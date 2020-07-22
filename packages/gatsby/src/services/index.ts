import { ServiceConfig } from "xstate"
import { IBuildContext } from "./"

import { startWebpackServer } from "./start-webpack-server"
import { rebuildSchemaWithSitePage } from "./rebuild-schema-with-site-pages"
import { extractQueries } from "./extract-queries"
import { writeOutRedirects } from "./write-out-redirects"
import { postBootstrap } from "./post-bootstrap"
import { buildSchema } from "./build-schema"
import { createPages } from "./create-pages"
import { createPagesStatefully } from "./create-pages-statefully"
import { customizeSchema } from "./customize-schema"
import { initialize } from "./initialize"
import { sourceNodes } from "./source-nodes"
import { writeOutRequires } from "./write-out-requires"
import { calculateDirtyQueries } from "./calculate-dirty-queries"
import { runStaticQueries } from "./run-static-queries"
import { runPageQueries } from "./run-page-queries"

import { waitUntilAllJobsComplete } from "../utils/wait-until-jobs-complete"
import { runMutationBatch } from "./run-mutation-batch"
import { recompile } from "./recompile"

export * from "./types"

export {
  customizeSchema,
  sourceNodes,
  createPages,
  buildSchema,
  createPagesStatefully,
  extractQueries,
  writeOutRequires,
  calculateDirtyQueries,
  runStaticQueries,
  runPageQueries,
  initialize,
  waitUntilAllJobsComplete,
  postBootstrap,
  writeOutRedirects,
  startWebpackServer,
  rebuildSchemaWithSitePage,
  runMutationBatch,
  recompile,
}

export const buildServices: Record<string, ServiceConfig<IBuildContext>> = {
  customizeSchema,
  sourceNodes,
  createPages,
  buildSchema,
  createPagesStatefully,
  extractQueries,
  writeOutRequires,
  calculateDirtyQueries,
  runStaticQueries,
  runPageQueries,
  initialize,
  waitUntilAllJobsComplete,
  postBootstrap,
  writeOutRedirects,
  startWebpackServer,
  rebuildSchemaWithSitePage,
  recompile,
}
