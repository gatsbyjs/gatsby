import {
  ComposeEnumTypeConfig,
  ComposeInputObjectTypeConfig,
  ComposeInterfaceTypeConfig,
  ComposeObjectTypeConfig,
  ComposeScalarTypeConfig,
  ComposeUnionTypeConfig,
} from "graphql-compose"

interface GatsbyGraphQLTypeKind {
  OBJECT: "OBJECT"
  INPUT_OBJECT: "INPUT_OBJECT"
  UNION: "UNION"
  INTERFACE: "INTERFACE"
  ENUM: "ENUM"
  SCALAR: "SCALAR"
}

export type GatsbyGraphQLType =
  | {
      kind: GatsbyGraphQLTypeKind["OBJECT"]
      config: ComposeObjectTypeConfig<any, any>
    }
  | {
      kind: GatsbyGraphQLTypeKind["INPUT_OBJECT"]
      config: ComposeInputObjectTypeConfig
    }
  | {
      kind: GatsbyGraphQLTypeKind["UNION"]
      config: ComposeUnionTypeConfig<any, any>
    }
  | {
      kind: GatsbyGraphQLTypeKind["INTERFACE"]
      config: ComposeInterfaceTypeConfig<any, any>
    }
  | {
      kind: GatsbyGraphQLTypeKind["ENUM"]
      config: ComposeEnumTypeConfig
    }
  | {
      kind: GatsbyGraphQLTypeKind["SCALAR"]
      config: ComposeScalarTypeConfig
    }
