exports.testAPIHook = ({ reporter }) => {
  const activity = reporter.createProgress(
    `progress activity with throwing`,
    100,
    0
  )
  activity.start()
  throw new Error(`error`)
  // not calling activity.end() or done() - api runner should do end it
}