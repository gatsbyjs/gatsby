import Queue from "better-queue"
import { IGatsbyNode } from "../types"
import { Span } from "opentracing"
import apiRunnerNode from "../../utils/api-runner-node"
import pDefer from "p-defer"
import reporter from "gatsby-cli/lib/reporter"

interface IScheduledOnCreateNode {
  node: IGatsbyNode
  traceId: string
  parentSpan: Span
  traceTags: { nodeId: string; nodeType: string }
}

type ScheduleOnCreateNodeFn = (arg: IScheduledOnCreateNode) => Promise<void>

let scheduleFunction: ScheduleOnCreateNodeFn

if (process.env.GATSBY_LIMIT_CONCURRENT_ON_CREATE_NODE) {
  reporter.verbose(
    `using GATSBY_LIMIT_CONCURRENT_ON_CREATE_NODE (${process.env.GATSBY_LIMIT_CONCURRENT_ON_CREATE_NODE})`
  )

  const queue = new Queue<IScheduledOnCreateNode, void>({
    process: function processScheduledOnCreateNode(
      task: IScheduledOnCreateNode,
      cb
    ): void {
      apiRunnerNode(`onCreateNode`, task)
        .then(() => cb(null))
        .catch(cb)
    },
    concurrent: parseInt(
      process.env.GATSBY_LIMIT_CONCURRENT_ON_CREATE_NODE,
      10
    ),
  })

  scheduleFunction = function queueOnCreateNode(args) {
    const deferred = pDefer<void>()

    queue.push(args, err => {
      if (err) {
        deferred.reject(err)
      } else {
        deferred.resolve()
      }
    })

    return deferred.promise
  }
} else {
  reporter.verbose(
    `NOT using GATSBY_LIMIT_CONCURRENT_ON_CREATE_NODE (${process.env.GATSBY_LIMIT_CONCURRENT_ON_CREATE_NODE})`
  )

  scheduleFunction = function runOnCreateNodeImmediately(args) {
    return apiRunnerNode(`onCreateNode`, args)
  }
}

export { scheduleFunction as scheduleOnCreateNode }
