const bootstrap = require(`../bootstrap`)
const report = require(`gatsby-cli/lib/reporter`)
const queryUtil = require(`../query`)
const tracer = require(`opentracing`).globalTracer()

const { store } = require(`../redux`)

module.exports = async program => {
  const buildSpan = tracer.startSpan(`build`)
  buildSpan.setTag(`directory`, program.directory)

  await bootstrap({
    ...program,
    parentSpan: buildSpan,
  })

  const queryIds = queryUtil.calcInitialDirtyQueryIds(store.getState())
  const { staticQueryIds } = queryUtil.groupQueryIds(queryIds)

  const activity = report.activityTimer(`run static queries`, {
    parentSpan: buildSpan,
  })
  activity.start()

  await queryUtil.processStaticQueries(staticQueryIds, {
    activity,
    state: store.getState(),
  })

  buildSpan.finish()
  activity.end()
}
