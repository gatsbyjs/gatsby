import { Path } from "graphql/jsutils/Path"

import report from "gatsby-cli/lib/reporter"
import { IActivityArgs } from "gatsby-cli/src/reporter/reporter"
import { IPhantomReporter } from "gatsby-cli/src/reporter/reporter-phantom"

import { IGraphQLSpanTracer } from "../schema/type-definitions"
import { pathToArray } from "./utils"

/**
 * Tracks and knows how to get a parent span for a particular
 *  point in query resolver for a particular query and path
 */
export default class GraphQLSpanTracer implements IGraphQLSpanTracer {
  parentActivity: IPhantomReporter
  activities: Map<string, IPhantomReporter>

  constructor(name: string, activityArgs: IActivityArgs) {
    this.parentActivity = report.phantomActivity(
      name,
      activityArgs
    ) as IPhantomReporter
    this.activities = new Map()
  }

  getParentActivity(): IPhantomReporter {
    return this.parentActivity
  }

  start(): void {
    this.parentActivity.start()
  }

  end(): void {
    this.activities.forEach(activity => {
      activity.end()
    })
    this.parentActivity.end()
  }

  createResolverActivity(path: Path, name: string): IPhantomReporter {
    let prev: Path | undefined = path.prev
    while (typeof prev?.key === `number`) {
      prev = prev.prev
    }
    const parentSpan = this.getActivity(prev).span
    const activity = report.phantomActivity(`GraphQL Resolver`, {
      parentSpan,
      tags: {
        field: name,
        path: pathToArray(path).join(`.`),
      },
    })
    this.setActivity(path, activity)
    return activity
  }

  getActivity(gqlPath: Path | undefined): IPhantomReporter {
    const path = pathToArray(gqlPath)
    let activity
    if (path.length > 0) {
      activity = this.activities.get(path.join(`.`))
      if (activity) {
        return activity
      }
    }

    return this.parentActivity
  }

  setActivity(gqlPath: Path, activity: IPhantomReporter): void {
    const path = pathToArray(gqlPath)
    this.activities.set(path.join(`.`), activity)
  }
}
