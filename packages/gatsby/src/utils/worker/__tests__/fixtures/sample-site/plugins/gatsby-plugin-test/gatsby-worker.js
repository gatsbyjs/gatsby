exports.TEST_JOB_HANDLER = async ({ args }) => {
  global.jobs.executedInThisProcess.push(args)

  if (args.throw) {
    throw new Error(`ERRORED: ${args.description}`)
  }
  // apparently we need to return objects :)
  return {
    processed: `PROCESSED: ${args.description}`
  }
}