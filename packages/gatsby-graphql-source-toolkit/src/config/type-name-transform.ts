import { ITypeNameTransform } from "../types"

export function createTypeNameTransform(prefix: string): ITypeNameTransform {
  return {
    toGatsbyTypeName: (remoteTypeName: string): string =>
      `${prefix}${remoteTypeName}`,
    toRemoteTypeName: (gatsbyTypeName: string): string =>
      gatsbyTypeName.substr(prefix.length),
  }
}
