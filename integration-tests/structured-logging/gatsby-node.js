const sleep = timeout => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}

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

  const unsuccessfulActivity = reporter.createProgress(
    `Failing activity`,
    100,
    0
  )
  unsuccessfulActivity.start()
  await sleep(500)
  unsuccessfulActivity.tick(75)
  unsuccessfulActivity.done(false)

  reporter.info(`info`)
  reporter.success(`success`)
  reporter.warn(`warn`)
  reporter.log(`log`)
  reporter.error(`error`)
}
