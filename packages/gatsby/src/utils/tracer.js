const slash = require(`slash`)
const fs = require(`fs`)
const path = require(`path`)
const opentracing = require(`opentracing`)

function initTracer(tracerFile) {
  let tracer
  if (tracerFile) {
    console.log(tracerFile)
    const resolvedPath = slash(path.resolve(tracerFile))
    const createTracer = require(resolvedPath)
    tracer = createTracer()
  } else {
    console.log('using noop tracer')
    tracer = new opentracing.Tracer() // Noop
  }

  opentracing.initGlobalTracer(tracer)

  return tracer
}

module.exports = {
  initTracer,
}
