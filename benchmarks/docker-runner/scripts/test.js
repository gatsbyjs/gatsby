const yargs = require(`yargs`)
const util = require('util')
const { exit } = require('process')
const exec = require('child_process').exec
const execPromise = util.promisify(exec)

const args = yargs
  .option(`memory`, {
    default: '2g',
    describe: `The memory limit for the docker container`,
  })
  .option(`num-nodes`, {
    default: '100',
    describe: `The number of nodes to generate in the build`,
  })
  .option(`node-size`, {
    default: '1k',
    describe: `The rough size of each node generated in the build`,
  })
  .option(`command`, {
    default: 'build',
    choices: ['build', 'develop'],
    describe: `The gatsby command to run for measurement`,
  })
  .option(`site`, {
    default: process.cwd(),
    describe: `The path to the site to use for testing`,
  })
  .option(`status`, {
    default: 'cold',
    choices: ['cold'],
    describe: `The status of the build`,
  }).parse()

const hostExec = (cmd, promise = true) => {
  console.log(`\x1b[2m$ ${cmd}\x1b[0m`)
  return promise ? execPromise(cmd) : exec(cmd)
}

const getDockerExec = (dockerId) => {
  return (cmd, env = {}, promise = true) => {
    const envVars = Object.keys(env).map(key => `-e ${key}=${env[key]}`)
    return hostExec(`docker exec ${envVars.join(' ')} ${dockerId} ${cmd}`, promise)
  }
}

async function build(dockerExec) {
  let code = 139
  let start = 0

  // there's something buggy with the node/exec/docker-exec integration
  // we're getting seg faults, so this loop is just a patch for that
  // so we don't have to fix it right now

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
          NUM_KEYS_IN_LARGE_SIZE_OBJ: 1,
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

  return {
    code,
    time: Math.round((Date.now() - start) / 10) / 100
  }
}

async function develop(dockerExec) {
  let code = undefined
  let message = undefined
  let start = 0

  while(code === undefined) {
    console.log(` - clearing cache`)
    await dockerExec(`rm -rf .cache`)

    console.log(` - running develop with ${args.numNodes} nodes of size ${args.nodeSize}`)

    start = Date.now()
    const process = dockerExec(
      `yarn gatsby develop -H 0.0.0.0 -p 9000`, 
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

  return {
    code,
    time: Math.round((Date.now() - start) / 10) / 100
  }
}

async function runTest() {

  const { stdout: testDockerId } = await hostExec(`./scripts/docker-get-id`)
  if (testDockerId.trim()) {
    console.log(`Docker container ${testDockerId.trim()} is currently running, shutting it down.`)
    await hostExec(`./scripts/docker-stop`);
  }

  console.log(`\nStarting container with ${args.memory} memory.`)
  const { stderr: dockerStartError } = await hostExec(`DOCKER_MEMORY_LIMIT=${args.memory} DOCKER_BENCHMARK_SITE=${args.site} ./scripts/docker-start`)
  if (dockerStartError) {
    console.log("Encountered an error:")
    console.log(dockerStartError)
    exit(1)
  }

  let { stdout: dockerId } = await hostExec(`./scripts/docker-get-id`)
  dockerId = dockerId.trim()

  const dockerExec = getDockerExec(dockerId)

  console.log(`\nStarting test using container ${dockerId}.`)

  const command = args.command === 'build' ? build : develop
  let {code, time} = await command(dockerExec)

  console.log(`Finished test in ${time}s`)
  
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