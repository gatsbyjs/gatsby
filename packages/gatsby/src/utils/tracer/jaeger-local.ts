// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { initTracer, JaegerTracer, TracingConfig } from "jaeger-client"

// The close method is currently in review at DefinitelyTyped:
// https://github.com/DefinitelyTyped/DefinitelyTyped/pull/44132
// Once that's merged, we can remove this manual extension and use the base version.
interface IJaegerTracerWithCLose extends JaegerTracer {
  close(callback?: () => void): void
}

let tracer: IJaegerTracerWithCLose

function create(): JaegerTracer {
  // See schema
  // https://github.com/jaegertracing/jaeger-client-node/blob/master/src/configuration.js#L37
  const config: TracingConfig = {
    serviceName: `gatsby`,
    reporter: {
      // Provide the traces endpoint; this forces the client to
      // connect directly to the Collector and send spans over HTTP
      collectorEndpoint: `http://localhost:14268/api/traces`,
    },
    sampler: {
      type: `const`,
      param: 1,
    },
  }
  const options = {}
  tracer = initTracer(config, options)
  return tracer
}

function stop(): Promise<void> {
  return new Promise(resolve => {
    tracer.close(resolve)
  })
}

export { create, stop }
