exports.onPreInit = ({ reporter }) => {
  reporter.panicOnBuild(`Konohagakure`)
  reporter.panicOnBuild(new Error(`Rasengan`))
  reporter.panicOnBuild(`Jiraiya`, new Error(`Tsunade`))
}