import type { Span } from "opentracing";
import reporter from "gatsby-cli/lib/reporter";
import type { IProgram } from "../../commands/types";
import type { Runner } from "../../bootstrap/create-graphql-runner";
import type { GraphQLRunner } from "../../query/graphql-runner";
import type { Store, AnyAction } from "redux";
import type { IGatsbyState } from "../../redux/types";
import type { GatsbyWorkerPool } from "../../utils/worker/pool";

type Reporter = typeof reporter;

export type IDataLayerContext = {
  reporter?: Reporter | undefined;
  deferNodeMutation?: boolean | undefined;
  nodesMutatedDuringQueryRun?: boolean | undefined;
  program?: IProgram | undefined;
  store?: Store<IGatsbyState, AnyAction> | undefined;
  parentSpan?: Span | undefined;
  gatsbyNodeGraphQLFunction?: Runner | undefined;
  graphqlRunner?: GraphQLRunner | undefined;
  webhookBody?: Record<string, unknown> | undefined;
  webhookSourcePluginName?: string | undefined;
  refresh?: boolean | undefined;
  workerPool?: GatsbyWorkerPool | undefined;
  pagesToBuild?: Array<string> | undefined;
  pagesToDelete?: Array<string> | undefined;
  shouldRunCreatePagesStatefully?: boolean | undefined;
};
