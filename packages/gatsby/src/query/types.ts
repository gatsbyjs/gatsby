import type { ExecutionResult } from "graphql";

export type IGraphQLRunnerStats = {
  totalQueries: number;
  uniqueOperations: Set<string>;
  uniqueQueries: Set<string>;
  totalRunQuery: number;
  totalPluralRunQuery: number;
  totalIndexHits: number;
  totalSiftHits: number;
  totalNonSingleFilters: number;
  comparatorsUsed: Map<string, number>;
  uniqueFilterPaths: Set<string>;
  uniqueSorts: Set<string>;
};

export type IGraphQLRunnerStatResults = {
  totalQueries: number;
  uniqueOperations: number;
  uniqueQueries: number;
  totalRunQuery: number;
  totalPluralRunQuery: number;
  totalIndexHits: number;
  totalSiftHits: number;
  totalNonSingleFilters: number;
  comparatorsUsed: Array<{ comparator: string; amount: number }>;
  uniqueFilterPaths: number;
  uniqueSorts: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PageContext = Record<string, any>;

export type IExecutionResult = {
  pageContext?: PageContext | undefined;
  serverData?: unknown | undefined;
} & ExecutionResult;
