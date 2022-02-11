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

const testsPerConfig = 10;

const config = {
  memory: [`1g`, `2g`, `4g`, `8g`, `16g`],
  numNodes: [`10`, `100`, `1000`, `10000`],
  nodeSize: [`128`, `1k`, `128k`, `512k`, `1m`]
}

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
}

async function executeTestSuites() {
  for (const memory of config.memory) {
    for (const numNodes of config.numNodes) {
      for (const nodeSize of config.nodeSize) {
        for (const i of Array.from(Array(testsPerConfig).keys())) {
          await runTest(memory, numNodes, nodeSize, i)
        }
      }
    }
  }
}

console.log(`Writing results to ${args.out}`)
executeTestSuites()
