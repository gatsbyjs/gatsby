import {
  INodeDeleteEvent,
  IRemoteId,
  ISourceChanges,
  ISourcingConfig,
  RemoteTypeName,
} from "../types"
import { touchNodes } from "./node-actions/touch-nodes"
import { fetchNodesById } from "./fetch-nodes/fetch-nodes"
import { createNodes } from "./node-actions/create-nodes"
import { deleteNodes } from "./node-actions/delete-nodes"
import { createSourcingContext } from "./sourcing-context"

/**
 * Uses sourcing config and a list of node change events (delta) to
 * delete nodes that no longer exist in the remote API and re-fetch
 * individual nodes that were updated in the remote API
 * since the last Gatsby build.
 */
export async function sourceNodeChanges(
  config: ISourcingConfig,
  delta: ISourceChanges
) {
  const context = createSourcingContext(config)
  const { updates, deletes } = groupChanges(delta)
  const promises: Promise<void>[] = []

  await touchNodes(context)
  for (const [remoteTypeName, ids] of updates) {
    const nodes = fetchNodesById(context, remoteTypeName, ids)
    const promise = createNodes(context, remoteTypeName, nodes)
    promises.push(promise)
  }
  await deleteNodes(context, deletes)
  await Promise.all(promises)
}

interface IChangeGroups {
  updates: Map<RemoteTypeName, IRemoteId[]>
  deletes: INodeDeleteEvent[]
}

function groupChanges(delta: ISourceChanges): IChangeGroups {
  const updates = new Map<RemoteTypeName, IRemoteId[]>()
  const deletes: INodeDeleteEvent[] = []

  delta.nodeEvents.forEach(event => {
    if (event.eventName === `UPDATE`) {
      const tmp = updates.get(event.remoteTypeName) ?? []
      tmp.push(event.remoteId)
      updates.set(event.remoteTypeName, tmp)
    }
    if (event.eventName === `DELETE`) {
      deletes.push(event)
    }
  })

  return { updates, deletes }
}
