global.jobs = {
  executedOnThisThread: [],
  createdOnThisThread: []
};

exports.createSchemaCustomization = async ({ actions }, pluginOptions) => {
  global.test = pluginOptions.fn()

  const sameJobInAllWorkersArgs = {
    description: `Same job created in all workers`
  }

  const commonJobDef = {
    name: `TEST_JOB_HANDLER`,
    inputPaths: [],
    outputDir: process.cwd()
  }

  global.jobs.createdOnThisThread.push(sameJobInAllWorkersArgs)
  actions.createJobV2({
    ...commonJobDef,
    args: sameJobInAllWorkersArgs,
  })

  const differentJobInAllWorkersArgs = {
    description: `Different job created in all workers (worker #${process.env.GATSBY_WORKER_ID})`
  }

  global.jobs.createdOnThisThread.push(differentJobInAllWorkersArgs)
  actions.createJobV2({
    ...commonJobDef,
    args: differentJobInAllWorkersArgs,
  })

  // exec on single worker - testing returned promises
  if (process.env.GATSBY_WORKER_ID === `1`) {
    const thenedJobArgs = {
      description: `.then() job`
    }
    global.jobs.createdOnThisThread.push(thenedJobArgs)
    actions.createJobV2({
      ...commonJobDef,
      args: thenedJobArgs
    }).then(results => {
      console.log(`.then results`, results)
    })

    const awaitedJobArgs = {
      description: `Awaited job`
    }
    global.jobs.createdOnThisThread.push(awaitedJobArgs)
    const results = await actions.createJobV2({
      ...commonJobDef,
      args: awaitedJobArgs
    })
    console.log(`await results`, results)
  }
}