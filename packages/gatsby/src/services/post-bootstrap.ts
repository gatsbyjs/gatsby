import reporter from "gatsby-cli/lib/reporter"
import { emitter } from "../redux"
import apiRunnerNode from "../utils/api-runner-node"
import { IDataLayerContext } from "../state-machines/data-layer/types"
import { boundActionCreators } from "../redux/actions"

export async function postBootstrap({
  parentSpan,
}: Partial<IDataLayerContext>): Promise<void> {
  const activity = reporter.activityTimer(`onPostBootstrap`, {
    parentSpan,
  })
  activity.start()
  await apiRunnerNode(`onPostBootstrap`, { parentSpan: activity.span })
  activity.end()

  reporter.info(reporter.stripIndent`
    bootstrap finished - ${process.uptime().toFixed(3)}s
  `)
  emitter.emit(`BOOTSTRAP_FINISHED`, {})
  boundActionCreators.setProgramStatus(`BOOTSTRAP_FINISHED`)
}
