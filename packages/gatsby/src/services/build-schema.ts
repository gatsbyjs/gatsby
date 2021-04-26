import { build } from "../schema"
import reporter from "gatsby-cli/lib/reporter"
import { IDataLayerContext } from "../state-machines/data-layer/types"

export async function buildSchema({
  parentSpan,
  refresh,
}: Partial<IDataLayerContext>): Promise<void> {
  if (
    refresh &&
    Boolean(process.env.GATSBY_EXPERIMENTAL_DISABLE_SCHEMA_REBUILD)
  ) {
    return
  }
  const Inspector = require(`inspector-api`)
  const inspector = new Inspector({ storage: { type: `fs` } })

  await inspector.profiler.enable()
  await inspector.profiler.start()
  await inspector.heap.enable()
  await inspector.heap.startSampling()
  const activity = reporter.activityTimer(`building schema`, {
    parentSpan,
  })
  activity.start()
  await build({ parentSpan: activity.span })
  activity.end()
  await inspector.profiler.stop()
  await inspector.heap.stopSampling()
  // process.exit()
}
