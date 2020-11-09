import {
  GraphQLEnumType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLUnionType,
} from "graphql"
import {
  ComposeObjectTypeConfig,
  ComposeInputObjectTypeConfig,
  ComposeInterfaceTypeConfig,
  ComposeUnionTypeConfig,
  ComposeEnumTypeConfig,
  ComposeScalarTypeConfig,
} from "graphql-compose"
import { TypeOrTypeDef } from "../../schema/types/type-defs"

enum GatsbyGraphQLTypeKind {
  OBJECT = `OBJECT`,
  INPUT_OBJECT = `INPUT_OBJECT`,
  UNION = `UNION`,
  INTERFACE = `INTERFACE`,
  ENUM = `ENUM`,
  SCALAR = `SCALAR`,
}

export type GatsbyGraphQLType<TSource, TContext> =
  | {
      kind: GatsbyGraphQLTypeKind.OBJECT
      config: ComposeObjectTypeConfig<TSource, TContext>
    }
  | {
      kind: GatsbyGraphQLTypeKind.INPUT_OBJECT
      config: ComposeInputObjectTypeConfig
    }
  | {
      kind: GatsbyGraphQLTypeKind.UNION
      config: ComposeUnionTypeConfig<TSource, TContext>
    }
  | {
      kind: GatsbyGraphQLTypeKind.INTERFACE
      config: ComposeInterfaceTypeConfig<TSource, TContext>
    }
  | {
      kind: GatsbyGraphQLTypeKind.ENUM
      config: ComposeEnumTypeConfig
    }
  | {
      kind: GatsbyGraphQLTypeKind.SCALAR
      config: ComposeScalarTypeConfig
    }

function buildObjectType<TSource, TContext>(
  config: ComposeObjectTypeConfig<TSource, TContext>
): GatsbyGraphQLType<TSource, TContext> {
  return {
    kind: GatsbyGraphQLTypeKind.OBJECT,
    config,
  }
}

function buildUnionType<TSource, TContext>(
  config: ComposeUnionTypeConfig<TSource, TContext>
): GatsbyGraphQLType<TSource, TContext> {
  return {
    kind: GatsbyGraphQLTypeKind.UNION,
    config,
  }
}

function buildInterfaceType<TSource, TContext>(
  config: ComposeInterfaceTypeConfig<TSource, TContext>
): GatsbyGraphQLType<TSource, TContext> {
  return {
    kind: GatsbyGraphQLTypeKind.INTERFACE,
    config,
  }
}

function buildInputObjectType<TSource, TContext>(
  config: ComposeInputObjectTypeConfig
): GatsbyGraphQLType<TSource, TContext> {
  return {
    kind: GatsbyGraphQLTypeKind.INPUT_OBJECT,
    config,
  }
}

function buildEnumType<TSource, TContext>(
  config: ComposeEnumTypeConfig
): GatsbyGraphQLType<TSource, TContext> {
  return {
    kind: GatsbyGraphQLTypeKind.ENUM,
    config,
  }
}

function buildScalarType<TSource, TContext>(
  config: ComposeScalarTypeConfig
): GatsbyGraphQLType<TSource, TContext> {
  return {
    kind: GatsbyGraphQLTypeKind.SCALAR,
    config,
  }
}

function isGatsbyType(
  something: TypeOrTypeDef
): something is GatsbyGraphQLType<any, any> {
  return (
    typeof something === `object` &&
    !(something instanceof GraphQLScalarType) &&
    !(something instanceof GraphQLObjectType) &&
    !(something instanceof GraphQLInterfaceType) &&
    !(something instanceof GraphQLUnionType) &&
    !(something instanceof GraphQLEnumType) &&
    !(something instanceof GraphQLList) &&
    !(something instanceof GraphQLNonNull) &&
    something.kind &&
    GatsbyGraphQLTypeKind[something.kind] !== undefined
  )
}

export {
  GatsbyGraphQLTypeKind,
  buildObjectType,
  buildUnionType,
  buildInterfaceType,
  buildInputObjectType,
  buildEnumType,
  buildScalarType,
  isGatsbyType,
}
