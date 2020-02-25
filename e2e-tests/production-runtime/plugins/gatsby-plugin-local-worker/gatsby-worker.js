const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout))

exports.TEST_JOB = async ({ args }) => {
  await sleep(5000)

  return {
    result: args.result,
  }
}
