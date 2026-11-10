exports.testAPIHook = ({ reporter }) => {
  const activity = reporter.activityTimer(`Spinner activity`)
  activity.start()
  // not calling activity.end() - api runner should do end it
}
