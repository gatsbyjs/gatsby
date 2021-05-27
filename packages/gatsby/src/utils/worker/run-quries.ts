import type { IGroupedQueryIds } from "../../services/types"
import { runStaticQueries, runPageQueries } from "../../services"
import { store } from "../../redux"

import { GraphQLRunner } from "../../query/graphql-runner"

export async function runQueries(queryIds: IGroupedQueryIds): Promise<void> {
  // console.log(`run queries ${process.env.JEST_WORKER_ID || `main`}`, queryIds)

  const graphqlRunner = new GraphQLRunner(store, {
    collectStats: true,
    graphqlTracing: store.getState().program.graphqlTracing,
  })

  await runStaticQueries({
    queryIds,
    // parentSpan: buildSpan,
    store,
    graphqlRunner,
  })

  await runPageQueries({
    queryIds,
    graphqlRunner,
    // parentSpan: buildSpan,
    store,
  })
}
