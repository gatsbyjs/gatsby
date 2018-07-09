const slash = require(`slash`)
const fs = require(`fs`)
const path = require(`path`)
const opentracing = require(`opentracing`)

let tracerProvider

function initTracer(tracerFile) {
  let tracer
  if (tracerFile) {
    console.log(tracerFile)
    const resolvedPath = slash(path.resolve(tracerFile))
    tracerProvider = require(resolvedPath)
    tracer = tracerProvider.create()
  } else {
    console.log('using noop tracer')
    tracer = new opentracing.Tracer() // Noop
  }

  opentracing.initGlobalTracer(tracer)

  return tracer
}

async function stopTracer() {
  if (tracerProvider) {
    if (tracerProvider.stop) {
      await tracerProvider.stop()
    }
  }
}

module.exports = {
  initTracer,
  stopTracer,
}
