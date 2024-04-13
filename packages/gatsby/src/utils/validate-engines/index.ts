import reporter from "gatsby-cli/lib/reporter"
import { WorkerPool } from "gatsby-worker"
import { isEqual } from "lodash"
import type { Span } from "opentracing"
import {
  getCurrentPlatformAndTarget,
  getFunctionsTargetPlatformAndTarget,
} from "../engines-helpers"

export async function validateEnginesWithActivity(
  directory: string,
  buildSpan?: Span
): Promise<void> {
  if (
    !isEqual(
      getCurrentPlatformAndTarget(),
      getFunctionsTargetPlatformAndTarget()
    )
  ) {
    reporter.info(
      `Skipping Rendering Engines validation as they are build for different platform and/or architecture`
    )
    return
  }

  const validateEnginesActivity = reporter.activityTimer(
    `Validating Rendering Engines`,
    {
      parentSpan: buildSpan,
    }
  )
  validateEnginesActivity.start()
  try {
    await validateEngines(directory)
  } catch (error) {
    validateEnginesActivity.panic({ id: `98001`, context: {}, error })
  } finally {
    validateEnginesActivity.end()
  }
}

async function validateEngines(directory: string): Promise<void> {
  const worker = new WorkerPool<typeof import("./child")>(
    require.resolve(`./child`),
    {
      numWorkers: 1,
      env: {
        // Do not "inherit" this env var for validation,
        // as otherwise validation will fail on any imports
        // that OpenTracing config might make
        GATSBY_OPEN_TRACING_CONFIG_FILE: ``,
      },
      silent: true,
    }
  )

  try {
    await worker.single.validate(directory)
  } finally {
    worker.end()
  }
}
