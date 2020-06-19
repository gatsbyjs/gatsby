import reporter from "gatsby-cli/lib/reporter"
import { IBuildContext } from "./"
import { emitter } from "../redux"
import apiRunnerNode from "../utils/api-runner-node"

export async function postBootstrap({
  parentSpan,
}: Partial<IBuildContext>): Promise<void> {
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
  require(`../redux/actions`).boundActionCreators.setProgramStatus(
    `BOOTSTRAP_FINISHED`
  )
}
