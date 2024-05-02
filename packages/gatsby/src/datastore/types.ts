import type { Database } from "lmdb";
import type { ActionsUnion, IGatsbyNode } from "../redux/types";
import type { GatsbyGraphQLType } from "../../index";
import type { IInputQuery } from "./common/query";
import type { IGraphQLRunnerStats } from "../query/types";
import type { GatsbyIterable } from "./common/iterable";
import type { IRunFilterArg } from "./in-memory/run-fast-filters";

export type NodeId = string;
export type NodeType = string;

export type ILmdbDatabases = {
  nodes: Database<IGatsbyNode, NodeId>;
  nodesByType: Database<NodeId, NodeType>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  indexes: Database<NodeId, Array<any>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Database<any, string>;
};

export type IQueryResult = {
  entries: GatsbyIterable<IGatsbyNode>;
  totalCount: () => Promise<number>;
};

export type ISort = {
  fields: Array<string>;
  order: Array<boolean | "asc" | "desc" | "ASC" | "DESC">;
};

export type IQueryArgs = {
  filter?: IInputQuery | undefined;
  sort?: ISort | undefined;
  limit?: number | undefined;
  skip?: number | undefined;
};

export type IRunQueryArgs = {
  gqlType: GatsbyGraphQLType | undefined;
  queryArgs: IQueryArgs;
  firstOnly?: boolean | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolvedFields?: Record<string, any> | undefined;
  nodeTypeNames: Array<string>;
  stats?: IGraphQLRunnerStats | undefined;
};

export type IDataStore = {
  getNode: (id: string) => IGatsbyNode | undefined;
  getTypes: () => Array<string>;
  countNodes: (typeName?: string | undefined) => number;
  ready: () => Promise<void>;
  iterateNodes: () => GatsbyIterable<IGatsbyNode>;
  iterateNodesByType: (type: string) => GatsbyIterable<IGatsbyNode>;
  runQuery: (args: IRunFilterArg) => Promise<IQueryResult>;
  updateDataStore: (action: ActionsUnion) => void;

  /** @deprecated */
  getNodes: () => Array<IGatsbyNode>;
  /** @deprecated */
  getNodesByType: (type: string) => Array<IGatsbyNode>;
};
