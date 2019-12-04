// @flow

import type {
  ComposeObjectTypeConfig,
  ComposeInputObjectTypeConfig,
  ComposeInterfaceTypeConfig,
  ComposeUnionTypeConfig,
  ComposeEnumTypeConfig,
  ComposeScalarTypeConfig,
} from "graphql-compose"

const GatsbyGraphQLTypeKind = {
  OBJECT: `OBJECT`,
  INPUT_OBJECT: `INPUT_OBJECT`,
  UNION: `UNION`,
  INTERFACE: `INTERFACE`,
  ENUM: `ENUM`,
  SCALAR: `SCALAR`,
}

export type GatsbyGraphQLType =
  | {
      kind: GatsbyGraphQLTypeKind.OBJECT,
      config: ComposeObjectTypeConfig,
    }
  | {
      kind: GatsbyGraphQLTypeKind.INPUT_OBJECT,
      config: ComposeInputObjectTypeConfig,
    }
  | {
      kind: GatsbyGraphQLTypeKind.UNION,
      config: ComposeUnionTypeConfig,
    }
  | {
      kind: GatsbyGraphQLTypeKind.INTERFACE,
      config: ComposeInterfaceTypeConfig,
    }
  | {
      kind: GatsbyGraphQLTypeKind.ENUM,
      config: ComposeEnumTypeConfig,
    }
  | {
      kind: GatsbyGraphQLTypeKind.SCALAR,
      config: ComposeScalarTypeConfig,
    }

const buildObjectType = config => {
  return {
    kind: GatsbyGraphQLTypeKind.OBJECT,
    config,
  }
}

const buildUnionType = config => {
  return {
    kind: GatsbyGraphQLTypeKind.UNION,
    config,
  }
}

const buildInterfaceType = config => {
  return {
    kind: GatsbyGraphQLTypeKind.INTERFACE,
    config,
  }
}

const buildInputObjectType = config => {
  return {
    kind: GatsbyGraphQLTypeKind.INPUT_OBJECT,
    config,
  }
}

const buildEnumType = config => {
  return {
    kind: GatsbyGraphQLTypeKind.ENUM,
    config,
  }
}

const buildScalarType = config => {
  return {
    kind: GatsbyGraphQLTypeKind.SCALAR,
    config,
  }
}

const isGatsbyType = something =>
  typeof something === `object` &&
  something.kind &&
  GatsbyGraphQLTypeKind[something.kind]

module.exports = {
  GatsbyGraphQLTypeKind,
  buildObjectType,
  buildUnionType,
  buildInterfaceType,
  buildInputObjectType,
  buildEnumType,
  buildScalarType,
  isGatsbyType,
}
