# Gatsby Parallel Runner

This is an early a parallel runner for gatsby that allows plugins and core parts of Gatsby to parallelize
suited tasks such as image processing.

When gatsby is started from a parent process with the environment variable `ENABLE_GATSBY_EXTERNAL_JOBS` set,
it will communicate some jobs up to the parent process via ipc, instead of running them in it's own internal
queue.

This allows a parent process to orchestrate certain task across multiple workers for better parallelization
through autoscaling cloud functions or the like.

Currently this plugin includes a processing queue implementation based on Google Cloud Functions, but the
general abstractions in place should make it easy to add similar runtimes for other cloud providers or via
different approaches to parallelization.

## Installation and usage

Install in your gatsby project:

```
npm i gatsby-parallel-runner
```

To use with Google Cloud, set relevant env variables in your shell:

```
export GOOGLE_APPLICATION_CREDENTIALS=~/path/to/your/google-credentials.json
export TOPIC=parallel-runner-topic
```

Deploy the cloud function:

```
npx gatsby-parallel-runner deploy

```

Then run your Gatsby build with the parallel runner instead of the default `gatsby build` command.

```
npx gatsby-parallel-runner
```

## Processor Queues, Processors and Implementations

Gatsby Parallel Runner comes with a set of core abstractions for parallelizing jobs.

The main orchestrator is the Processor Queue that gives invididual processors a simple interface for
sending jobs to cloud functions and getting back results:

```js
const result = await queue.process(job)
```

To do it's job, the ProcessorQueue needs a `pubSubImplementation` that must provide
`push(msg)` and `subscribe(handler)` methods for enqueuing new jobs and receiving
results.

Implementations are defined in `src/processor-queue/implementations` and there's currently
just one of them based on Google's Cloud Functions.

The `src/processors` folder has the different processors that can be triggered via Gatsby's
external job feature.

The processor folder must be named after the Redux event that should trigger it. Ie, the
Image Processing processor gets triggered by the sharp plugin via an `IMAGE_PROCESSING` job,
so the folder is called `image-processing`

Each processor can have a set of implementations based on the Processor Queue implementations
available.

There's currently just one processor (image-processing), with an implementation for `google-functions`.

When running `npx gatsby-parallel-runner deploy`, the active processor queue implementation will
make sure to deploy all the cloud function needed for the available processors.

