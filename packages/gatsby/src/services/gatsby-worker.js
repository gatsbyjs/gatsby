exports.GENERATE_PAGE = ({ paths }) => {
  // for (const segment of pageQuerySegments) {
  //   pool.single
  //     .runQueries({ pageQueryIds: segment, staticQueryIds: [] })
  //     .then(replayWorkerActions)
  //     .then(() => {
  //       activity.tick(segment.length)
  //     })
  //     .catch(handleRunQueriesInWorkersQueueError)
  // }

  // For now, fail the worker
  throw new Error(`Generate Page failed locally. Worker is not implemented.`)
}
