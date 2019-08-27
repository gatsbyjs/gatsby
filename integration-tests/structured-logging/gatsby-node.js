const sleep = timeout =>
  new Promise(resolve => {
    setTimeout(resolve, timeout)
  })

exports.createPages = async ({ reporter }) => {
  const successfulActivity = reporter.createProgress(
    `Successful activity`,
    100,
    0
  )
  successfulActivity.start()
  await sleep(500)
  successfulActivity.tick(50)
  await sleep(500)
  successfulActivity.done()

  if (process.env.FAILING_ACTIVITY) {
    const unsuccessfulActivity = reporter.createProgress(
      `Failing activity`,
      100,
      0
    )
    unsuccessfulActivity.start()
    await sleep(500)
    unsuccessfulActivity.tick(75)
    unsuccessfulActivity.panicOnBuild(`Your car is on fire`)
  }

  reporter.info(`info`)
  reporter.success(`success`)
  reporter.warn(`warn`)
  reporter.log(`log`)
  reporter.error(`error`)

  if (process.env.PANIC_ON_BUILD) {
    reporter.panic(`Your house is on fire`)
  }
}
