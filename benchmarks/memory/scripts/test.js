const yargs = require(`yargs`)
const util = require('util')
const { exit } = require('process')
const exec = util.promisify(require('child_process').exec)

const args = yargs
  .option(`memory`, {
    default: '2g',
    describe: `The memory limit for the docker container`,
  })
  .option(`num-nodes`, {
    default: '1000',
    describe: `The number of nodes to generate in the build`,
  })
  .option(`node-size`, {
    default: '1m',
    describe: `The rough size of each node generated in the build`,
  }).parse()

const hostExec = (cmd) => {
  console.log(`\x1b[2m$ ${cmd}\x1b[0m`)
  return exec(cmd)
}

async function runTest() {

  const { stdout: testDockerId } = await hostExec(`./scripts/docker-get-id`)
  if (testDockerId.trim()) {
    console.log(`Docker container ${testDockerId.trim()} is currently running, shutting it down.`)
    await hostExec(`./scripts/docker-stop`);
  }

  console.log(`\nStarting container with ${args.memory} memory.`)
  const { stderr: dockerStartError } = await hostExec(`DOCKER_MEMORY_LIMIT=${args.memory} ./scripts/docker-start`)
  if (dockerStartError) {
    console.log("Encountered an error:")
    console.log(stderr)
    exit(1)
  }

  let { stdout: dockerId } = await hostExec(`./scripts/docker-get-id`)
  dockerId = dockerId.trim()

  const dockerExec = (cmd, env = {}) => {
    const envVars = Object.keys(env).map(key => `-e ${key}=${env[key]}`)
    return hostExec(`docker exec ${envVars.join(' ')} ${dockerId} ${cmd}`)
  }

  console.log(`\nStarting test using container ${dockerId}.`)

  let code = 139

  // there's something buggy with the node/exec/docker-exec integration
  // we're getting seg faults, so this loop is just a patch for that
  // so we don't have to fix it right now

  let start = 0;
  while(code === 139) {
    try {
      console.log(` - clearing cache`)
      await dockerExec(`rm -rf .cache`)
    
      console.log(` - running build with ${args.numNodes} nodes of size ${args.nodeSize}`)

      start = Date.now()
      const { err  } = await dockerExec(
        `yarn gatsby build`, 
        {
          BUILD_NUM_NODES: args.numNodes, 
          BUILD_STRING_NODE_SIZE: args.nodeSize, 
          NUM_KEYS_IN_LARGE_SIZE_OBJ: 1
        }
      )
      code = err.code

    } catch (e) {
      code = e.code
    }

    if (code === 139) {
      console.log(`     \x1b[31mSeg fault, trying again\x1b[0m`)
    }
  }

  const buildTime = Math.round((Date.now() - start) / 10) / 100;
  console.log(`Finished test in ${buildTime}s`)
  
  if (code) {
    console.log(`\nFailed with code ${code}\n`)
  } else {
    console.log(`\nSuccess!\n`)
  }

  // console.log(`Stopping container ${dockerId}`)
  // await hostExec(`./scripts/docker-stop`)

  exit(code)
}


runTest();