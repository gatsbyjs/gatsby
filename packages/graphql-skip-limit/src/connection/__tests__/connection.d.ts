import {
  GraphQLFieldConfigMap,
  GraphQLFieldResolver,
  GraphQLObjectType,
  Thunk,
} from "graphql"

export type ConnectionConfig = {
  name?: string | null;
  nodeType: GraphQLObjectType;
  resolveNode?: GraphQLFieldResolver<any, any> | null;
  edgeFields?: Thunk<GraphQLFieldConfigMap<any, any>> | null;
  connectionFields?: Thunk<GraphQLFieldConfigMap<any, any>> | null;
};

export type GraphQLConnectionDefinitions = {
  edgeType: GraphQLObjectType;
  connectionType: GraphQLObjectType;
};
