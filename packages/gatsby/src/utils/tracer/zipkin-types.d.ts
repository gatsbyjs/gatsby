import zipkin from "zipkin"
import logger from "zipkin-transport-http"
import { Span } from "opentracing"
import { HeadersInit } from "node-fetch"

export class ZipkinPartialSpan {
  traceId: string
  timeoutTimestamp: number
  delegate: Span
  localEndpoint: unknown
  shouldFlush: boolean
}

export class ZipkinBatchRecorder extends zipkin.BatchRecorder {
  partialSpans: Map<string, ZipkinPartialSpan>
  _timedOut(span: ZipkinPartialSpan): boolean
  _writeSpan(id: string): void
}

export class ZipkinHttpLogger extends logger.HttpLogger {
  queue: string[]
  endpoint: string
  headers: HeadersInit
  timeout: number
  errorListenerSet: boolean
  emit(event: string | symbol, ...args: any[]): boolean
}
