import { ITypeNameTransform } from "../types"

export function createTypeNameTransform(prefix: string): ITypeNameTransform {
  return {
    toGatsbyTypeName: remoteTypeName => `${prefix}${remoteTypeName}`,
    toRemoteTypeName: gatsbyTypeName => gatsbyTypeName.substr(prefix.length),
  }
}
