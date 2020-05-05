const { onPostBootstrap } = require(`gatsby-plugin-manifest/gatsby-node`)
const reporter = require(`gatsby-cli/lib/reporter`)
const fs = require(`fs-extra`)

//Config for executing onPostBootstrap
const pluginOptions = {
  name: `GatsbyJS`,
  short_name: `GatsbyJS`,
  start_url: `/`,
  background_color: `#ffffff`,
  theme_color: `#663399`,
  display: `minimal-ui`,
  icon: `../../www/src/assets/gatsby-icon.png`,
  cache_busting_mode: `none`,
}

//Global Variables
let results = { seconds: [], nanoseconds: [] }
let sum = [0, 0]
let rounds = process.env.TOTAL_ROUNDS || 20

//Execute a single test of onPostBootstrap
async function executeBootstrap() {
  const timeStart = process.hrtime()
  await onPostBootstrap({ reporter }, pluginOptions)
  const timeEnd = process.hrtime(timeStart)

  // console.info(
  //   "Execution time (hr): %ds %dms",
  //   timeEnd[0],
  //   timeEnd[1] / 1000000
  // )

  results.seconds.push(timeEnd[0])
  results.nanoseconds.push(timeEnd[1])
  sum[0] += timeEnd[0]
  sum[1] += timeEnd[1]

  fs.removeSync(`public/icons`)
  fs.removeSync(`public/manifest.webmanifest`)
}

//Loop test to run multiple times and calculate results
async function runTest() {
  console.info(`Timing 'onPostBootstrap' running ${rounds} times.`)

  for (let i = 0; i < rounds; i++) {
    // process.stdout.write(`Round ${i + 1}: `)
    await executeBootstrap()
  }

  let averageSum = [0, 0]
  averageSum[0] = sum[0] / rounds
  averageSum[1] = sum[1] / rounds

  console.info(
    `\nAverage execution time (hr): %ds %dms`,
    averageSum[0],
    averageSum[1] / 1000000
  )

  console.info(
    `\nMax execution time (hr): ${Math.max(...results.nanoseconds) / 1000000}ms`
  )
  console.info(
    `\nMin execution time (hr): ${Math.min(...results.nanoseconds) / 1000000}ms`
  )

  console.info(
    `\nRange execution time (hr): ${
      (Math.max(...results.nanoseconds) - Math.min(...results.nanoseconds)) /
      1000000
    }ms`
  )
}

//execute
runTest()
