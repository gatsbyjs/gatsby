import zipkin from "zipkin"
import { HttpLogger } from "zipkin-transport-http"
import ZipkinTracer from "zipkin-javascript-opentracing"
import fetch from "node-fetch"
import { ZipkinBatchRecorder, ZipkinHttpLogger } from "./zipkin-types"

let logger: ZipkinHttpLogger
let recorder: ZipkinBatchRecorder

/**
 * Create and return an open-tracing compatible tracer. See
 * https://github.com/opentracing/opentracing-javascript/blob/master/src/tracer.ts
 */
export const create = (): ZipkinTracer => {
  logger = new HttpLogger({
    // endpoint of local docker zipkin instance
    endpoint: `http://localhost:9411/api/v1/spans`,
  }) as ZipkinHttpLogger

  recorder = new zipkin.BatchRecorder({
    logger,
    // timeout = 60 hours, must be longer than site's build time
    timeout: 60 * 60 * 60 * 1000000,
  }) as ZipkinBatchRecorder

  const tracer = new ZipkinTracer({
    localServiceName: `gatsby`,
    serviceName: `gatsby`,
    // Sample 1 out of 1 spans (100%). When tracing production
    // services, it is normal to sample 1 out of 10 requests so that
    // tracing information doesn't impact site performance. But Gatsby
    // is a build tool and only has "1" request (the
    // build). Therefore, we must set this to 100% so that spans
    // aren't missing
    sampler: new zipkin.sampler.CountingSampler(1),
    traceId128Bit: true,
    recorder,
    kind: `client`,
  })

  return tracer
}

// Workaround for issue in Zipkin HTTP Logger where Spans are not
// cleared off their processing queue before the node.js process
// exits. Code is mostly the same as the zipkin processQueue
// implementation.
const _processQueue = async (): Promise<void> => {
  if (logger.queue.length > 0) {
    const postBody = `[${logger.queue.join(`,`)}]`
    try {
      const response = await fetch(logger.endpoint, {
        method: `POST`,
        body: postBody,
        headers: logger.headers,
        timeout: logger.timeout,
      })

      if (response.status !== 202) {
        const err =
          `Unexpected response while sending Zipkin data, status:` +
          `${response.status}, body: ${postBody}`

        if (logger.errorListenerSet) logger.emit(`error`, new Error(err))
        else console.error(err)
      }
    } catch (error) {
      const err = `Error sending Zipkin data ${error}`
      if (logger.errorListenerSet) logger.emit(`error`, new Error(err))
      else console.error(err)
    }
  }
}

/**
 * Run any tracer cleanup required before the node.js process
 * exits. For Zipkin HTTP, we must manually process any spans still on
 * the queue
 */
export const stop = async (): Promise<void> => {
  // First, write all partial spans to the http logger
  recorder.partialSpans.forEach((span, id) => {
    if (recorder._timedOut(span)) {
      recorder._writeSpan(id)
    }
  })

  // Then tell http logger to process all spans in its queue
  await _processQueue()
}
