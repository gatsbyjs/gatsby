import { ISchemaCustomizationContext } from "../../types"

export function resolveRemoteType(
  context: ISchemaCustomizationContext,
  source: any
): string | void {
  if (!source || typeof source !== `object`) {
    return undefined
  }
  const typeNameField = context.gatsbyFieldAliases[`__typename`]
  const remoteTypeName = source[typeNameField]
  return typeof remoteTypeName === `string` ? remoteTypeName : undefined
}
