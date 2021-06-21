exports.TEST_JOB_HANDLER = async ({ args }) => {
  global.jobs.executedOnThisThread.push(args)

  // apparently we need to return objects :)
  return {
    processed: `PROCESSED: ${args.description}`
  }
}