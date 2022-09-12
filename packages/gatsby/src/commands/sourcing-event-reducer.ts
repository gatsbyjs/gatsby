interface ISourcing {
  startTime: string
  traceId: string
  endTime: string
  durationMs: number
  newNodeCount: number
  updatedNodeCount: number
  deletedNodeCount: number
  events: Array<any>
}

const sourcings = new Map<string, ISourcing>()
let currentSourcing

function reduce(event) {
  let sourcing

  switch (event.type) {
    case `SOURCING_STARTED`:
      const newSourcing: ISourcing = {}
      currentSourcing = event.traceId
      newSourcing.startTime = event.timestamp
      newSourcing.traceId = event.traceId
      newSourcing.newNodeCount = 0
      newSourcing.updatedNodeCount = 0
      newSourcing.deletedNodeCount = 0
      newSourcing.events = [event]
      sourcings.set(event.traceId, newSourcing)
      break
    case `SOURCING_ENDED`:
      currentSourcing = undefined
      sourcing = sourcings.get(event.traceId)
      if (sourcing) {
        sourcing.events.push(event)
        sourcing.endTime = event.timestamp
        sourcing.durationMs = sourcing.endTime - sourcing.startTime
      }
      break
    case `CREATE_NODE`:
      sourcing = sourcings.get(event.traceId)
      if (sourcing) {
        sourcing.events.push(event)
        if (event.oldNode) {
          sourcing.updatedNodeCount += 1
        } else {
          sourcing.newNodeCount += 1
        }
      }
      break
    case `DELETE_NODE`:
      sourcing = sourcings.get(currentSourcing)
      if (sourcing) {
        sourcing.events.push(event)
        sourcing.deletedNodeCount += 1
      }
      break
  }

  return sourcings
}

export default reduce
