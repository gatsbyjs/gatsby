const yargs = require(`yargs`)
const util = require(`util`)
const fs = require(`fs`)
const { exit } = require(`process`)
const exec = util.promisify(require(`child_process`).exec)
var path = require(`path`);

const args = yargs
  .option(`name`, {
    default: 'test-suite',
    describe: `The name to save this suite's results to`,
  })
  .option(`suite`, {
    default: `incremental`,
    describe: `Which test suite to run`,
    choices: ['incremental', 'exhaustive']
  })
  .option(`show-test-output`, {
    default: ``,
    describe: `Show the output from ./scripts/test.js`,
  }).parse()

const Reset = "\x1b[0m"
const Dim = "\x1b[2m"
const Underline = "\x1b[4m"
const Black = "\x1b[30m"
const Red = "\x1b[31m"
const Green = "\x1b[32m"
const Yellow = "\x1b[33m"
const Blue = "\x1b[34m"
const Magenta = "\x1b[35m"
const Cyan = "\x1b[36m"
const White = "\x1b[37m"

const hostExec = (cmd, showCommand = true) => {
  if (showCommand) {
    console.log(`${Dim}$ ${cmd}${Reset}`)
  }

  return exec(cmd)
}

// Set up output dir
let outputDir = `output/${args.name}`
let outputDirIndex = 0
const resultsFile = `${outputDir}/results.csv`;

while (fs.existsSync(outputDir)) {
  outputDirIndex += 1
  outputDir = `output/${args.name}-${outputDirIndex}`
}

fs.mkdirSync(outputDir, {recursive: true})

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Write final results of a build
function writeResults(build, memory, numNodes, nodeSize, result, code, time, maxMemoryUsage) {  
  if (!fs.existsSync(resultsFile)) {
    const csvColumns = `build,memory,numNodes,nodeSize,result,code,time,maxMemoryUsage`
    fs.writeFileSync(resultsFile, `${csvColumns}\n`)
  }

  fs.writeFileSync(resultsFile, `${[build, memory, numNodes, nodeSize, result, code, time, maxMemoryUsage].join(',')}\n`, { flag: 'a+' })
}

// Write individual memory metrics of a build
function writeMetrics(name, metrics, buildTime) {
  const outputFile = `${outputDir}/${name}.csv`;

  if (!fs.existsSync(outputFile)) {
    const csvColumns = `build,timestamp,memory,numNodes,nodeSize,usage`
    fs.writeFileSync(outputFile, `${csvColumns}\n`)
  }

  // write file contents, but only if they come from after the build started
  for (const {build, timestamp, memory, numNodes, nodeSize, usage} of metrics) {
    const normalizedTime = timestamp - buildTime;
    if (normalizedTime >= 0) {
      fs.writeFileSync(outputFile, `${[build, normalizedTime, memory, numNodes, nodeSize, usage].join(',')}\n`, { flag: 'a+' })
    }
  }
}

async function runTest(memory, numNodes, nodeSize, i) {
  console.log(`\n${Underline + Cyan}Running test #${i} for ${memory} mem, ${numNodes} nodes of ${nodeSize}${Reset}`)

  let stdout = "";
  let code = 139;

  const memoryStatFile = path.join(__dirname, `..`, `.docker.memusage`)
  let buildFinished = false;
  let metrics = []

  // start the build
  hostExec(`yarn test --memory ${memory} --num-nodes ${numNodes} --node-size ${nodeSize}`)
    .then((result) => {
      stdout = result.stdout
      code = 0
    })
    .catch((e) => {
      stdout = e.stdout
      code = e.code
    })
    .finally(() => {
      buildFinished = true;
    })

  const start = Date.now()

  // loop until the build has finished
  const buildName = `mem=${memory}`
  while (!buildFinished) {

    if (fs.existsSync(memoryStatFile)) {
      // get docker container stats
      const stat = fs.readFileSync(memoryStatFile).toString().trim()

      if (stat && parseInt(stat) !== 0) {
        metrics.push({
          build: i + 1, 
          timestamp: Date.now() - start, 
          memory, 
          numNodes, 
          nodeSize, 
          usage: stat
        })
      }
    }

    await sleep(250)
  }
  
  // grab results
  const timerRegex = /Finished test in (.+)s/
  const match = stdout.match(timerRegex)
  const time = parseFloat(match[1])

  if (args.showTestOutput) {
    console.log(stdout)
  }

  const maxMemoryUsage = Math.max.apply(Math, metrics.map(m => m.usage))
  writeMetrics(buildName, metrics, time * 1000)
  writeResults(i + 1, memory, numNodes, nodeSize, code === 0 ? 'success' : 'failure', code, time, maxMemoryUsage)

  if (code === 0) {
    console.log(`${Green}Built after ${time}s!${Reset}`)
  } else {
    console.log(`${Red}Failed with exit code ${code} after ${time}s.${Reset}`)
  }

  return code
}


/*
 * Incremental Test Suite
 *
 * Runs tests for each memory config until all tests under the constraints fail.
 * This sets up nodes of 1m and doubles the amount of nodes for each test.
 */

const incrementalTestsPerConfig = 15;
const incrementalConfig = {
  memory: [`2g`, `4g`, `8g`],
  numNodesInitial: 100,
  numNodesIncrement: (previous) => previous + 100,
  nodeSize: `1m`
}

async function incremental() {
  for (const memory of incrementalConfig.memory) {
    let numNodes = incrementalConfig.numNodesInitial;
    let allTestsFailed = false;

    while (!allTestsFailed) {
      // reset allTestsFailed
      allTestsFailed = true;

      for (let i = 0; i < incrementalTestsPerConfig; i++) {
        const code = await runTest(memory, numNodes, incrementalConfig.nodeSize, i)

        // if a single test passed, we want to loop again
        if (code === 0) {
          allTestsFailed = false;
        }
      }

      if (allTestsFailed) {
        console.log(`\n${Yellow}All tests failed for ${memory} memory, ${numNodes} nodes.${Reset}`)
      }

      // increment our numNodes for the next run
      numNodes = incrementalConfig.numNodesIncrement(numNodes)
    }
  }
}

/*
 * Exhaustive Test Suite
 * 
 * Runs N tests for each config in the powerset of the exhaustiveConfig
 * below, where N is exhaustiveTestsPerConfig.
 */

const exhaustiveTestsPerConfig = 16;
const exhaustiveConfig = {
  memory: [`16g`, `8g`, `4g`, `2g`],
  numNodes: [`100`, `1000`, `10000`],
  nodeSize: [`1k`, `512k`, `1m`]
}

async function exhaustive() {
  for (const memory of exhaustiveConfig.memory) {
    for (const numNodes of exhaustiveConfig.numNodes) {
      for (const nodeSize of exhaustiveConfig.nodeSize) {
        for (let i = 0; i < exhaustiveTestsPerConfig; i++) {
          await runTest(memory, numNodes, nodeSize, i)
        }
      }
    }
  }
}

console.log(`Writing ${args.suite} results to ${outputDir}`)

if (args.suite === 'incremental') {
  incremental()
} else if (args.suite === 'exhaustive') {
  exhaustive()
}
