import reporter from "gatsby-cli/lib/reporter"

import { Span } from "opentracing"

// import { initTracer, stopTracer } from "./utils/tracer"

// const initPromise = initTracer(process.env.GATSBY_OPEN_TRACING_CONFIG_FILE ?? ``)

export async function test(
  args: Array<string>,
  parentSpan?: Span
): Promise<string> {
  // await initPromise
  let activity
  if (parentSpan) {
    activity = reporter.activityTimer(`test`, { parentSpan })
    activity.start()
  }

  await new Promise(resolve => setTimeout(resolve, 1000))

  if (activity) {
    activity.end()
  }

  return args.join(" ")
}
