import * as Inspector from "inspector"
import * as fs from "fs-extra"

let gc = global.gc
if (!gc) {
  const v8 = require(`v8`)
  const vm = require(`vm`)

  v8.setFlagsFromString(`--expose_gc`)
  gc = vm.runInNewContext(`gc`)

  global.gc = gc
}

const MaxDeltaSamples = new Map()

function formatMem(sample: NodeJS.MemoryUsage): string {
  return `R:${Math.round(sample.rss / 1000000)
    .toLocaleString()
    .padStart(9, ` `)}M  |  hT:${Math.round(sample.heapTotal / 1000000)
    .toLocaleString()
    .padStart(9, ` `)}M  |  hU:${Math.round(sample.heapUsed / 1000000)
    .toLocaleString()
    .padStart(9, ` `)}M  |  E:${Math.round(sample.external / 1000000)
    .toLocaleString()
    // @ts-ignore arrayBuffers not in typings for some reason
    .padStart(9, ` `)}M  |  AB:${Math.round(sample.arrayBuffers / 1000000)
    .toLocaleString()
    .padStart(9, ` `)}M`
}

function beforeAfterMemorySample(
  type: string,
  label: string
): () => Promise<void> {
  const beforeMemory = process.memoryUsage()

  return async (): Promise<void> => {
    const afterMemory = process.memoryUsage()

    gc()
    const afterGCMemory = process.memoryUsage()

    let maxDeltas = MaxDeltaSamples.get(type)
    if (!maxDeltas) {
      maxDeltas = {
        after: {
          rss: 0,
          heapTotal: 0,
          heapUsed: 0,
          external: 0,
          arrayBuffers: 0,
        },
        afterGC: {
          rss: 0,
          heapTotal: 0,
          heapUsed: 0,
          external: 0,
          arrayBuffers: 0,
        },
      }
      MaxDeltaSamples.set(type, maxDeltas)
    }
    let max = MaxSamples.get(type)
    if (!max) {
      max = {
        after: {
          rss: 0,
          heapTotal: 0,
          heapUsed: 0,
          external: 0,
          arrayBuffers: 0,
        },
        afterGC: {
          rss: 0,
          heapTotal: 0,
          heapUsed: 0,
          external: 0,
          arrayBuffers: 0,
        },
      }
      MaxSamples.set(type, max)
    }

    for (const stage of [`after`, `afterGC`]) {
      const partChanged: Array<string> = []
      for (const part of [
        `rss`,
        `heapTotal`,
        `heapUsed`,
        `external`,
        `arrayBuffers`,
      ]) {
        const current =
          stage === `afterGC` ? afterGCMemory[part] : afterMemory[part]
        const currentDelta = current - beforeMemory[part]

        const soFarMaxDelta = maxDeltas[stage][part]

        if (
          currentDelta > soFarMaxDelta * 1.2 &&
          currentDelta - soFarMaxDelta > 20 * 1000 * 1000
        ) {
          partChanged.push(`${part} Delta`)
          maxDeltas[stage][part] = currentDelta
        }

        const soFarMax = max[stage][part]

        if (
          current > soFarMax * 1.5 ||
          current - soFarMax > 200 * 1000 * 1000
        ) {
          partChanged.push(`${part} Max`)
          max[stage][part] = current
        }
      }

      if (partChanged.length > 0) {
        const after = stage === `afterGC` ? afterGCMemory : afterMemory
        console.log(
          `During "${type}" on "${
            process.env.GATSBY_WORKER_ID
              ? `worker #${process.env.GATSBY_WORKER_ID}`
              : `main`
          }" for "${label}" memory (${
            stage === `afterGC` ? `after` : `before`
          } GC) (${partChanged.join(`,`)}):\nStart: ${formatMem(
            beforeMemory
          )}\nEnd:   ${formatMem(after)}\nDelta: ${formatMem({
            rss: after.rss - beforeMemory.rss,
            heapTotal: after.heapTotal - beforeMemory.heapTotal,
            heapUsed: after.heapUsed - beforeMemory.heapUsed,
            external: after.external - beforeMemory.external,
            // @ts-ignore arrayBuffers not in typings for some reason
            arrayBuffers: after.arrayBuffers - beforeMemory.arrayBuffers,
          })}\n`
        )

        if (stage === `afterGC`) {
          await takeHeapSnapshot(`${type}-${label.replace(/\//g, `_`)}`)
        }
      }
    }
  }
}

export { gc, beforeAfterMemorySample }

// Trick found in https://stackoverflow.com/questions/56311832/how-to-find-a-particular-object-in-devtools-memory-snapshot-if-the-type-of-the-o/67566509#67566509
// This will allow us to "tag" objects so we can locate them easily in heap snapshots

const taggedItemsByType = new Map()

class TaggedItem {
  // @ts-ignore ref is not used, just for heap snapshot tracking
  private ref: any

  constructor(data) {
    // This ref helps us inspect what is retaining the original data
    this.ref = data
  }
}

type TaggedItemType = typeof TaggedItem
type ClassCreator = (classToExtend: TaggedItemType) => TaggedItemType

const nameToWrappers = new Map()

export function memoryTrackingFactory(
  constructorName: string,
  classCreator: ClassCreator
): <T>(data: T) => T {
  let wrapper = nameToWrappers.get(constructorName)
  if (wrapper) {
    return wrapper
  }

  const Class = classCreator(TaggedItem)

  let taggedItems = taggedItemsByType.get(constructorName)
  if (!taggedItems) {
    taggedItems = new WeakMap()
    taggedItemsByType.set(constructorName, taggedItems)
  }

  wrapper = function <T>(dataToTrack: T): T {
    if (
      dataToTrack &&
      typeof dataToTrack === `object` &&
      !taggedItems.has(dataToTrack)
    ) {
      const tag = new Class(dataToTrack)
      // @ts-ignore T / object
      taggedItems.set(dataToTrack, tag)
    }
    return dataToTrack
  }

  nameToWrappers.set(constructorName, wrapper)

  return wrapper
}

// Couldn't figure out how to dynamically create a class / constructor with dynamic name,
// so just doing class creation here as second param
// unfortunately this also mean we can't really have separate constructors for different
// node types as we have to declare all types ahead of time
export const memoryDecorationGatsbyNode = memoryTrackingFactory(
  `GatsbyNode`,
  Base => class GatsbyNode extends Base {}
)

export const memoryDecorationGatsbyPage = memoryTrackingFactory(
  `GatsbyPage`,
  Base => class GatsbyPage extends Base {}
)

if (!process.env.GATSBY_DEBUG_MEMORY_RUN_ID) {
  process.env.GATSBY_DEBUG_MEMORY_RUN_ID = Date.now().toString()
}

// https://nodejs.org/api/inspector.html#heap-profiler
const snapshotLabelsCounter = new Map()
export async function takeHeapSnapshot(label: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const session = new Inspector.Session()
    session.connect()

    let counter = snapshotLabelsCounter.get(label) ?? 1

    const dir = `public/.heap-snapshots/${process.env.GATSBY_DEBUG_MEMORY_RUN_ID}`

    const fname = `${dir}/${label}-${
      process.env.GATSBY_WORKER_ID
        ? `worker-${process.env.GATSBY_WORKER_ID}`
        : `main`
    }${counter < 2 ? `` : `-${counter}`}.heapsnapshot`

    fs.ensureDirSync(dir)
    const fd = fs.openSync(fname, `w`)

    counter++
    snapshotLabelsCounter.set(label, counter)

    session.on(`HeapProfiler.addHeapSnapshotChunk`, m => {
      fs.writeSync(fd, m.params.chunk)
    })

    session.post(`HeapProfiler.takeHeapSnapshot`, undefined, err => {
      fs.closeSync(fd)

      session.disconnect()

      if (err) {
        return reject(err)
      }

      console.log(`takeHeapSnapshot "${fname}" done`)
      return resolve()
    })
  })
}
