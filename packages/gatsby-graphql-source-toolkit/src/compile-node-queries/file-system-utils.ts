import * as path from "path"
import * as fs from "fs"
import { Source } from "graphql"
import { GraphQLSource, RemoteTypeName } from "../types"
import {
  IDefaultFragmentsConfig,
  generateDefaultFragments,
} from "./generate-default-fragments"

/**
 * Utility function that tries to load fragments from given path
 * and generates default fragments when some of the fragments do not exist
 */
export async function readOrGenerateDefaultFragments(
  fragmentsDir: string,
  config: IDefaultFragmentsConfig
): Promise<Map<RemoteTypeName, GraphQLSource>> {
  const defaultFragments = generateDefaultFragments(config)
  const result = new Map<RemoteTypeName, GraphQLSource>()

  for (const [remoteTypeName, fragment] of defaultFragments) {
    const fileName = path.join(fragmentsDir, `${remoteTypeName}.graphql`)
    let source
    try {
      source = new Source(fs.readFileSync(fileName).toString(), fileName)
    } catch (e) {
      fs.writeFileSync(fileName, fragment)
      source = new Source(fragment, fileName)
    }
    result.set(remoteTypeName, source)
  }

  return result
}
