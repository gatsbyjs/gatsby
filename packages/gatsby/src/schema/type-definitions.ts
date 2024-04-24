import type { GraphQLResolveInfo } from "graphql";
import type { Path } from "graphql/jsutils/Path";

import type { IPhantomReporter } from "gatsby-cli/lib/reporter/reporter-phantom";

import type { IGraphQLRunnerStats } from "../query/types";

export type IGatsbyResolverContext<TSource, TArgs> = {
  defaultFieldResolver: GatsbyResolver<TSource, TArgs>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodeModel: any;
  stats: IGraphQLRunnerStats | null;
  tracer: IGraphQLSpanTracer | null;
  telemetryResolverTimings?: Array<IGraphQLTelemetryRecord> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export type GatsbyGraphQLResolveInfo = GraphQLResolveInfo & {
  from?: string | undefined;
  fromNode?: boolean | undefined;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GatsbyResolver<TSource, TArgs = { [argName: string]: any }> = (
  source: TSource,
  args: TArgs,
  context: IGatsbyResolverContext<TSource, TArgs>,
  info: GatsbyGraphQLResolveInfo,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => any;

export type IGatsbyConnection<NodeType> = {
  totalCount: () => Promise<number>;
  edges: Array<IGatsbyEdge<NodeType>>;
  nodes: Array<NodeType>;
  pageInfo: IGatsbyPageInfo;
};

export type IGatsbyEdge<NodeType> = {
  node: NodeType;
  next: NodeType | undefined;
  previous: NodeType | undefined;
};

export type IGatsbyPageInfo = {
  currentPage: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  itemCount: number;
  pageCount: () => Promise<number>;
  perPage: number | undefined;
  totalCount: () => Promise<number>;
};

export type IGraphQLSpanTracer = {
  getParentActivity: () => IPhantomReporter;
  createResolverActivity: (path: Path, name: string) => IPhantomReporter;
};

export type IGraphQLTelemetryRecord = {
  name: string;
  duration: number;
};
