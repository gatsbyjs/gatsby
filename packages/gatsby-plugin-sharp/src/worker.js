const sleep = ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })

exports.IMAGE_PROCESSING = async () => {
  console.log(`Processing...`)
  await sleep(5000)
  return `DONE`
}
