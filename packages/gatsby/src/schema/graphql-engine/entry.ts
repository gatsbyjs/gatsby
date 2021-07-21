import { buildSchema } from "../schema"
import type { GraphQLSchema } from "graphql"
import { setupLmdbStore } from "../../datastore/lmdb/lmdb-datastore"

export class GraphQLEngine {
  private schema: GraphQLSchema

  constructor({ dbPath }: { dbPath: string }) {
    setupLmdbStore({ dbPath })
  }

  private async getSchema(): Promise<GraphQLSchema> {
    if (!this.schema) {
      this.schema = await buildSchema({
        types: [SCHEMA_SNAPSHOT],
      })
    }

    return this.schema
  }

  public async runQuery(pathName: string): Promise<any> {}
}
