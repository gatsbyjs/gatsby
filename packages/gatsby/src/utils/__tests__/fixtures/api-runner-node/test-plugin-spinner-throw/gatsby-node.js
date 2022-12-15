exports.testAPIHook = ({ reporter }) => {
  const activity = reporter.activityTimer(
    `spinner activity with throwing`
  )
  activity.start()
  throw new Error(`error`)
  // not calling activity.end() - api runner should do end it
}