import { initTracer, JaegerTracer, TracingConfig } from "jaeger-client"

let tracer: JaegerTracer

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
