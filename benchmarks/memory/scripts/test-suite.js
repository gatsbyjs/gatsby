const yargs = require(`yargs`)
const util = require(`util`)
const fs = require(`fs`)
const { exit } = require(`process`)
const exec = util.promisify(require(`child_process`).exec)
var path = require(`path`);

const args = yargs
  .option(`out`, {
    default: `suite.csv`,
    describe: `The file to save results to`,
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

const hostExec = (cmd) => {
  console.log(`${Dim}$ ${cmd}${Reset}`)
  return exec(cmd)
}

// reset csv output file
const csvColumns = `build,memory,numNodes,nodeSize,result,code,time`
fs.writeFileSync(args.out, `${csvColumns}\n`)

function writeResults(build, memory, numNodes, nodeSize, result, code, time) {
  fs.writeFileSync(args.out, `${[build, memory, numNodes, nodeSize, result, code, time].join(',')}\n`, { flag: 'a+' })
}

async function runTest(memory, numNodes, nodeSize, i) {
  console.log(`\n${Underline + Cyan}Running test #${i} for ${memory} mem, ${numNodes} nodes of ${nodeSize}${Reset}`)
  
  let stdout = "";
  let code = 139;

  try {
    const {stdout: testOutput} = await hostExec(`yarn test --memory ${memory} --num-nodes ${numNodes} --node-size ${nodeSize}`)
    stdout = testOutput
    code = 0
  } catch (e) {
    code = e.code
    stdout = e.stdout
  }
  
  const timerRegex = /Finished test in (.+)s/
  const match = stdout.match(timerRegex)
  const time = match[1]

  if (args.showTestOutput) {
    console.log(stdout)
  }

  if (code === 0) {
    console.log(`${Green}Built after ${time}s!${Reset}`)
  } else {
    console.log(`${Red}Failed with exit code ${code} after ${time}s.${Reset}`)
  }

  writeResults(i + 1, memory, numNodes, nodeSize, code === 0 ? 'success' : 'failure', code, time)

  return code
}


/*
 * Incremental Test Suite
 *
 * Runs tests for each memory config until all tests under the constraints fail.
 * This sets up nodes of 1m and doubles the amount of nodes for each test.
 */

const incrementalTestsPerConfig = 16;
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

console.log(`Writing ${args.suite} results to ${args.out}`)

if (args.suite === 'incremental') {
  incremental()
} else if (args.suite === 'exhaustive') {
  exhaustive()
}
