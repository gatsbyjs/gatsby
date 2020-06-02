import { IBuildContext } from "../state-machines/develop"
import reporter from "gatsby-cli/lib/reporter"
import { buildHTML } from "../commands/build-html"
import { Stage } from "../commands/types"

export async function writeHTML({
  program,
  parentSpan,
  workerPool,
  pagesToBuild = [],
}: Partial<IBuildContext>): Promise<void> {
  console.log(`writing html`)
  if (!program) {
    return
  }
  const activity = reporter.createProgress(
    `Building static HTML`,
    pagesToBuild.length,
    0,
    {
      parentSpan,
    }
  )
  activity.start()
  try {
    await buildHTML({
      program: program,
      stage: Stage.BuildHTML,
      pagePaths: pagesToBuild,
      activity,
      workerPool: workerPool,
    })
  } catch (err) {
    let id = `95313`
    if (err.message === `ReferenceError: window is not defined`) {
      id = `95312`
    }

    reporter.panic({
      id,
      error: err,
      context: {
        errorPath: err.context && err.context.path,
      },
    })
  }
  activity.done()
}
