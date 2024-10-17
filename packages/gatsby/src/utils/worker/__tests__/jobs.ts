import "jest-extended"
import { createTestWorker, GatsbyTestWorkerPool } from "./test-helpers"
import { store } from "../../../redux"
import * as path from "path"
import { waitUntilAllJobsComplete } from "../../jobs/manager"
import type { MessagesFromChild, MessagesFromParent } from "../messaging"
import { getReduxJobs, getJobsMeta } from "./test-helpers/child-for-tests"
import { compileGatsbyFiles } from "../../parcel/compile-gatsby-files"

// jest.mock(`gatsby-cli/lib/reporter`, () => jest.fn())

let worker: GatsbyTestWorkerPool | undefined

describe(`worker (jobs)`, () => {
  let mainProcessJobsMeta: ReturnType<typeof getJobsMeta>
  let workersJobsMeta: Array<ReturnType<typeof getJobsMeta>>
  let jobDescriptionsCreatedByWorkers: Array<Array<string>>
  let mainStateAfter: ReturnType<typeof getReduxJobs>
  let workerStateAfter: Array<ReturnType<typeof getReduxJobs>>
  let sendMessageSpy: jest.SpyInstance<
    void,
    [msg: MessagesFromParent, workerId: number]
  >
  let receivedMessageSpy: jest.Mock<
    void,
    [msg: MessagesFromChild, workerId: number]
  >

  beforeAll(async () => {
    store.dispatch({ type: `DELETE_CACHE`, cacheIsCorrupt: true })

    worker = createTestWorker(3)

    sendMessageSpy = jest.spyOn(worker, `sendMessage`)
    receivedMessageSpy = jest.fn()
    worker.onMessage(receivedMessageSpy)

    const siteDirectory = path.join(__dirname, `fixtures`, `sample-site`)
    await compileGatsbyFiles(siteDirectory)

    await Promise.all(
      worker.all.loadConfigAndPlugins({
        siteDirectory,
        processFlags: false,
      })
    )

    // plugin API creates a job
    await Promise.all(worker.all.runAPI(`createSchemaCustomization`))

    // waiting on main for all jobs to be completed
    await waitUntilAllJobsComplete()

    workersJobsMeta = await Promise.all(worker.all.getJobsMeta())

    mainProcessJobsMeta = getJobsMeta()

    jobDescriptionsCreatedByWorkers = workersJobsMeta.map(meta =>
      meta.createdInThisProcess.map(jobArgs => jobArgs.description)
    )

    mainStateAfter = getReduxJobs()
    workerStateAfter = await Promise.all(worker.all.getReduxJobs())
  })

  afterAll(async () => {
    if (worker) {
      await Promise.all(worker.end())
      worker = undefined
    }
  })

  describe(`worker`, () => {
    it(`no jobs gets executed in worker - we forward all of them to main`, () => {
      expect(workersJobsMeta).toSatisfyAll(
        ({ executedInThisProcess }) => executedInThisProcess.length === 0
      )
    })

    it(`jobs get created by workers`, () => {
      expect(workersJobsMeta).toSatisfyAll(
        ({ createdInThisProcess }) => createdInThisProcess.length === 6
      )

      // we expect some common jobs to be created by all workers
      expect(jobDescriptionsCreatedByWorkers).toSatisfyAll(
        jobDescriptionsCreatedByTheWorker =>
          jobDescriptionsCreatedByTheWorker.includes(
            `Same job created in all workers`
          ) &&
          jobDescriptionsCreatedByTheWorker.includes(`.then() job`) &&
          jobDescriptionsCreatedByTheWorker.includes(`.catch() job`) &&
          jobDescriptionsCreatedByTheWorker.includes(`Awaited job`) &&
          jobDescriptionsCreatedByTheWorker.includes(`try/catched awaited job`)
      )

      // we expect worker specific jobs
      expect(jobDescriptionsCreatedByWorkers[0][1]).toEqual(
        `Different job created in all workers (worker #1)`
      )
      expect(jobDescriptionsCreatedByWorkers[1][1]).toEqual(
        `Different job created in all workers (worker #2)`
      )
      expect(jobDescriptionsCreatedByWorkers[2][1]).toEqual(
        `Different job created in all workers (worker #3)`
      )
    })

    describe(`returned promises`, () => {
      it(`.then on createJobV2 action creator is called when job finishes`, () => {
        // we expect .then callback in worker to be called with results
        expect(workersJobsMeta).toSatisfyAll(
          ({ dotThenWasCalledWith }: (typeof workersJobsMeta)[0]) =>
            dotThenWasCalledWith?.processed === `PROCESSED: .then() job`
        )
      })

      it(`await on createJobV2 resumes when job finishes`, () => {
        expect(workersJobsMeta).toSatisfyAll(
          ({ awaitReturnedWith }: (typeof workersJobsMeta)[0]) =>
            awaitReturnedWith?.processed === `PROCESSED: Awaited job`
        )
      })

      it(`.catch on createJobV2 action creator is called when job fails`, () => {
        expect(workersJobsMeta).toSatisfyAll(
          ({ dotCatchWasCalledWith }: (typeof workersJobsMeta)[0]) =>
            dotCatchWasCalledWith === `ERRORED: .catch() job`
        )
      })

      it(`error is caught when awaited job fails`, () => {
        expect(workersJobsMeta).toSatisfyAll(
          ({ awaitThrewWith }: (typeof workersJobsMeta)[0]) =>
            awaitThrewWith === `ERRORED: try/catched awaited job`
        )
      })
    })
  })

  describe(`main`, () => {
    it(`no job is created on main process`, () => {
      expect(mainProcessJobsMeta.createdInThisProcess).toMatchInlineSnapshot(
        `Array []`
      )
    })

    it(`all jobs are executed on main process`, () => {
      // We expect all jobs to be executed in main process.
      // ".then() job", "Awaited job" and "Same job created in all workers" is the same
      // job created in all workers so we expect it to be deduped and only execute this job
      // once
      expect(
        mainProcessJobsMeta.executedInThisProcess
          .map(jobArgs => jobArgs.description)
          .sort()
      ).toMatchInlineSnapshot(`
            Array [
              ".catch() job",
              ".then() job",
              "Awaited job",
              "Different job created in all workers (worker #1)",
              "Different job created in all workers (worker #2)",
              "Different job created in all workers (worker #3)",
              "Same job created in all workers",
              "try/catched awaited job",
            ]
        `)
    })
  })

  describe(`redux state`, () => {
    it(`workers don't maintain jobs state`, () => {
      // all of workers should have no tracking of jobs
      expect(workerStateAfter).toSatisfyAll(
        ({ complete, incomplete }) =>
          complete.length === 0 && incomplete.length === 0
      )
    })

    it(`jobs state is preserved by main`, () => {
      expect(
        mainStateAfter.complete
          .map(completedJob => completedJob.result.processed)
          .sort()
      ).toMatchInlineSnapshot(`
        Array [
          "PROCESSED: .then() job",
          "PROCESSED: Awaited job",
          "PROCESSED: Different job created in all workers (worker #1)",
          "PROCESSED: Different job created in all workers (worker #2)",
          "PROCESSED: Different job created in all workers (worker #3)",
          "PROCESSED: Same job created in all workers",
        ]
      `)
    })
  })

  describe(`messages (worker<->parent communication)`, () => {
    it(`worker pool receives messages about created jobs from workers`, () => {
      expect(receivedMessageSpy).toBeCalledWith(
        expect.objectContaining({
          type: `JOB_CREATED`,
          payload: expect.objectContaining({
            id: expect.any(String),
            args: {
              description: expect.any(String),
            },
          }),
        }),
        expect.toBeOneOf([1, 2, 3])
      )
    })

    it(`worker pool reports job completion back to workers`, () => {
      expect(sendMessageSpy).toBeCalledWith(
        expect.objectContaining({
          type: `JOB_COMPLETED`,
          payload: expect.objectContaining({
            id: expect.any(String),
            result: {
              processed: expect.any(String),
            },
          }),
        }),
        expect.toBeOneOf([1, 2, 3])
      )
    })

    it(`worker pool reports job failure back to workers`, () => {
      expect(sendMessageSpy).toBeCalledWith(
        expect.objectContaining({
          type: `JOB_FAILED`,
          payload: {
            id: expect.any(String),
            error: expect.any(String),
            stack: expect.any(String),
          },
        }),
        expect.toBeOneOf([1, 2, 3])
      )
    })
  })
})
