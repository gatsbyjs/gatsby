const yargs = require(`yargs`)
const util = require('util')
const { exit } = require('process')
const exec = require('child_process').exec
const execPromise = util.promisify(exec)

const args = yargs
  .option(`memory`, {
    default: '4g',
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

const hostExec = (cmd, promise = true) => {
  console.log(`\x1b[2m$ ${cmd}\x1b[0m`)
  return promise ? execPromise(cmd) : exec(cmd)
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
    console.log(dockerStartError)
    exit(1)
  }

  let { stdout: dockerId } = await hostExec(`./scripts/docker-get-id`)
  dockerId = dockerId.trim()

  const dockerExec = (cmd, env = {}, promise = true) => {
    const envVars = Object.keys(env).map(key => `-e ${key}=${env[key]}`)
    return hostExec(`docker exec ${envVars.join(' ')} ${dockerId} ${cmd}`, promise)
  }

  console.log(`\nStarting test using container ${dockerId}.`)

  let start = 0
  let code = undefined
  let message = undefined

  while(code === undefined) {
    console.log(` - clearing cache`)
    await dockerExec(`rm -rf .cache`)
  
    console.log(` - running build with ${args.numNodes} nodes of size ${args.nodeSize}`)

    start = Date.now()
    const process = dockerExec(
      `yarn gatsby develop --port 9000`, 
      {
        BUILD_NUM_NODES: args.numNodes, 
        BUILD_STRING_NODE_SIZE: args.nodeSize, 
        NUM_KEYS_IN_LARGE_SIZE_OBJ: 1
      },
      false
    )

    // wait until we see development bundle was successfully built, then exit
    process.stdout.on('data', (data) => {
      const line = data.toString()
      if (line.indexOf("Building development bundle -") >= 0) {
        message = line.trim()
        code = line.indexOf("success") >= 0 ? 0 : 1
        process.kill()
      }
    })
  
    process.on('exit', (c) => {
      if (!message) {
        code = c
      }
    })

    while(code === undefined) {
      await new Promise(r => setTimeout(r, 100));
    }

    if (code === 139) {
      console.log(`     \x1b[31mSeg fault, trying again\x1b[0m`)
      code = undefined
    }
  }

  console.log(`\nFinal development message: ${message}`)

  const buildTime = Math.round((Date.now() - start) / 10) / 100;
  console.log(`Finished test in ${buildTime}s`)
  
  if (code) {
    console.log(`\nFailed with code ${code}\n`)
  } else {
    console.log(`\nSuccess!\n`)
  }

  console.log(`Stopping container ${dockerId}`)
  await hostExec(`./scripts/docker-stop`)

  exit(code)
}


runTest();