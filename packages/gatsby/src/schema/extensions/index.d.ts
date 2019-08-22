import { ComposeFieldConfig, ComposeOutputType } from "graphql-compose"
import { GraphQLFieldConfig, GraphQLFieldConfigArgumentMap } from "graphql"

export interface GraphQLFieldExtensionDefinition {
  name: string
  type?: ComposeOutputType<any, any>
  args?: GraphQLFieldConfigArgumentMap
  extend(
    args: GraphQLFieldConfigArgumentMap,
    prevFieldConfig: GraphQLFieldConfig<any, any>
  ): Partial<ComposeFieldConfig<any, any>>
}
