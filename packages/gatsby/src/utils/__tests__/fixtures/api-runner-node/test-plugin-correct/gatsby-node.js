exports.testAPIHook =  ({ reporter }) => {
  const spinnerActivity = reporter.activityTimer(
    `control spinner activity`
  )
  spinnerActivity.start()
  // calling activity.end() to make sure api runner doesn't call it more than needed
  spinnerActivity.end()

  const progressActivity = reporter.createProgress(
    `control progress activity`
  )
  progressActivity.start()
  // calling activity.done() to make sure api runner doesn't call it more than needed
  progressActivity.done()
}