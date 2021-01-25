# Dagsby

An experimental library for orchestrating job running and data processing across processes/machines within Gatsby.

## Components

- **task/job** defines inputs/outputs, dependencies, and code to execute
- **worker pool** pool of node.js processes which can execute jobs
- **runner** Uses N worker pools to run tasks.

## Getting started

`npm i dagsby`

Start a worker pool:

```sh
node node_modules/dagsby/dist/worker-pool-server.js --numWorkers 4 --socketPort 9999 --httpPort 10020
```

Create a simple task in a test.js file and run it on the worker pool.

```js
const dagsby = require(`dagsby`)

;(async () => {
  // Create our runner.
  const runner = await dagsby.createRunner({
    pools: [{ socketPort: 9999, httpPort: 10020 }],
  })

  // Create a simple task
  const task = await dagsby.createTask({
    func: args => `Hello ${args.name}!`,
    // Written using Arvo's schema language.
    argsSchema: [
      {
        name: `name`,
        type: `string`,
      },
    ],
  })

  // Setup the task on the worker pool(s).
  await runner.setupTask(task)

  // Run the task!
  const result = await runner.executeTask({ task, args: { name: `World` } })
})()
```

Let's try a more complex task where we specify a required file & add an NPM dependency.

First create a file called `hello.txt` with some text in it.

Then add this code to our test file.

```js
;(async () => {
  const mySecondTask = await dagsby.createTask({
    func: (args, { files }) => {
      const fs = require(`fs`)
      const _ = require(`lodash`)
      const text = fs.readFileSync(files.text.localPath)
      const camelCase = _.camelCase(text)

      return `${args.preface} ${text} \n\n ${camelCase}`
    },
    argsSchema: [{ name: `preface`, type: `string` }],
    dependencies: {
      lodash: `latest`,
    },
    files: {
      text: {
        originPath: path.join(__dirname, `mocks`, `hello.txt`),
      },
    },
  })
  await runner.setupTask(task)

  const result = await runner.executeTask({
    task,
    args: { preface: `yeeesss` },
  })

  console.log(result)
})()
```

## TODOs

- [ ] support (again) running multiple types of tasks in parallel.
- [ ] support multiple pools in runners.
