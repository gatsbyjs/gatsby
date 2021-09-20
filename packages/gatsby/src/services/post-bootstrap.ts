import reporter from "gatsby-cli/lib/reporter"
import { emitter, store } from "../redux"
import apiRunnerNode from "../utils/api-runner-node"
import { IDataLayerContext } from "../state-machines/data-layer/types"
import { actions } from "../redux/actions"

export async function postBootstrap({
  parentSpan,
  deferNodeMutation,
}: Partial<IDataLayerContext>): Promise<void> {
  const activity = reporter.activityTimer(`onPostBootstrap`, {
    parentSpan,
  })
  activity.start()
  await apiRunnerNode(`onPostBootstrap`, {
    parentSpan: activity.span,
    deferNodeMutation,
  })
  activity.end()

  reporter.info(reporter.stripIndent`
    bootstrap finished - ${process.uptime().toFixed(3)}s
  `)
  emitter.emit(`BOOTSTRAP_FINISHED`, {})
  store.dispatch(actions.setProgramStatus(`BOOTSTRAP_FINISHED`))
}
