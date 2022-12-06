exports.testAPIHook = ({ reporter }) => {
  const activity = reporter.createProgress(
    `progress activity`,
    100,
    0
  )
  activity.start()
  // not calling activity.end() or done() - api runner should do end it
}
