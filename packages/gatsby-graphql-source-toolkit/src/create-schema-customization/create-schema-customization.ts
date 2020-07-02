import { ISchemaCustomizationContext, ISourcingConfig } from "../types"
import { buildTypeDefinition } from "./build-types"
import { GatsbyGraphQLType } from "gatsby"
import { buildSourcingPlan } from "./analyze/build-sourcing-plan"
import { createNodeIdTransform } from "../config/node-id-transform"
import { createTypeNameTransform } from "../config/type-name-transform"
import { defaultGatsbyFieldAliases } from "../config/default-gatsby-field-aliases"

/**
 * Uses sourcing config to define Gatsby types explicitly
 * (using Gatsby schema customization API).
 */
export async function createSchemaCustomization(config: ISourcingConfig) {
  const context = createSchemaCustomizationContext(config)

  // FIXME:
  const typeDefs: GatsbyGraphQLType[] = []

  for (const typeName of collectTypesToCustomize(context)) {
    const typeDef = buildTypeDefinition(context, typeName)
    if (typeDef) {
      typeDefs.push(typeDef)
    }
  }
  context.gatsbyApi.actions.createTypes(typeDefs)
}

function collectTypesToCustomize(context: ISchemaCustomizationContext) {
  return new Set([
    ...context.sourcingPlan.fetchedTypeMap.keys(),
    ...context.gatsbyNodeDefs.keys(),
  ])
}

function createSchemaCustomizationContext(
  config: ISourcingConfig
): ISchemaCustomizationContext {
  const gatsbyFieldAliases =
    config.gatsbyFieldAliases ?? defaultGatsbyFieldAliases

  const {
    idTransform = createNodeIdTransform(gatsbyFieldAliases),
    typeNameTransform = createTypeNameTransform(config.gatsbyTypePrefix),
  } = config

  return {
    ...config,
    gatsbyFieldAliases,
    idTransform,
    typeNameTransform,
    sourcingPlan: buildSourcingPlan(config),
  }
}
