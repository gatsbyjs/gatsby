import { slash } from "gatsby-core-utils"
import path from "path"
import { Tracer, initGlobalTracer } from "opentracing"

let tracerProvider

/**
 * tracerFile should be a js file that exports two functions.
 *
 * `create` - Create and return an open-tracing compatible tracer. See
 * https://github.com/opentracing/opentracing-javascript/blob/master/src/tracer.ts
 *
 * `stop` - Run any tracer cleanup required before the node.js process
 * exits
 */
export const initTracer = (tracerFile: string): Tracer => {
  let tracer: Tracer
  if (tracerFile) {
    const resolvedPath = slash(path.resolve(tracerFile))
    tracerProvider = require(resolvedPath)
    tracer = tracerProvider.create()
  } else {
    tracer = new Tracer() // Noop
  }

  initGlobalTracer(tracer)

  return tracer
}

export const stopTracer = async (): Promise<void> => {
  if (tracerProvider && tracerProvider.stop) {
    await tracerProvider.stop()
  }
}
