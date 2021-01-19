const fs = require("fs")
const path = require("path")
const faker = require(`faker`)
const genJpg = require("js-image-generator")
const rimraf = require("rimraf")
const ProgressBar = require("progress")

const C = parseInt(process.env.C, 10) || 0 // Worker count. If non-zero, shards the image generation and generates N images regardless.
const N = parseInt(process.env.N, 10) || 100 // Article count
const W = parseInt(process.env.W, 10) || 640 // Image width
const H = parseInt(process.env.H, 10) || 326 // Image height

let Worker, isMainThread, parentPort, workerData
try {
  // worker_threads is node 10.15 ...
  ;({
    Worker,
    isMainThread,
    parentPort,
    workerData,
  } = require("worker_threads"))
} catch (e) {
  if (C > 0) {
    console.log('')
    console.warn(
      "!! Worker threads are supported by nodejs from node 10.15 onwards. Proceeding in single thread mode. Consider upgrading nodejs. !!"
    )
    console.log('')
  }
}

if (typeof Worker !== "undefined" && !isMainThread) {
  const { offset, count, width, height } = workerData
  const imgDir = "./generated_image_pools/jpg/" + width + "x" + height
  console.log(
    "Worker; generating",
    count,
    "images of",
    width,
    "x",
    height,
    ". From",
    offset + ".jpg",
    "to",
    offset + count - 1 + ".jpg",
    "into",
    imgDir
  )
  let i = 0
  function again() {
    if (i >= count) {
      // The end.
      return
    }

    genJpg.generateImage(width, height, 80, function (err, image) {
      fs.writeFileSync(path.join(imgDir, offset + i + ".jpg"), image.data)
      parentPort.postMessage(1)
    })

    ++i
    setImmediate(again)
  }

  // Need to do this async otherwise any postMessage after the first will be blocked
  setImmediate(again)

  // This is valid in toplevel in nodejs.
  return
}

console.log("Start of gen")
console.time("End of gen")

const imgDir = "./generated_image_pools/jpg/" + W + "x" + H

if (!fs.existsSync("./generated_image_pools")) {
  fs.mkdirSync("./generated_image_pools", { recursive: true })
}
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true })
}

generateImagePool()
  .then(generateArticles)
  .then(() => {
    console.timeEnd("End of gen")
    console.log()
  })
  .catch(e => {
    throw new Error(e.stack)
  })

function generateImagePool() {
  // Image generation is quite expensive so rather than regenerate the images per run, we generate
  // a static pool of images and copy from that to the correct position when needed. Takes up more
  // space (not a concern in this context) but is a lot faster.
  // It literally takes 10 minutes to generate single thread generate 1000 images of default dimensions, 2 hours for 128k of them.

  console.log(
    "Making sure there are enough",
    W,
    "x",
    H,
    "jpg images in the pool"
  )

  if (C > 0 && typeof Worker !== "undefined") {
    // Ignore existing images of this size and regenerate all of them
    return forceRegenerateAllWithWorkers()
  } else {
    if (C > 0) {
      console.log("")
      console.log("RUNNING SINGLE CORE !! Ignoring `C` option because it requires a newer nodejs !! RUNNING SINGLE CORE")
      console.log("")
    }
    // Assume existing images cover entire range 0 to count-1. Only generate count to N-1, single threaded
    return incrementallyRegenerateNoWorkers()
  }
}

function forceRegenerateAllWithWorkers() {
  rimraf.sync(imgDir)
  fs.mkdirSync(imgDir, { recursive: true })

  let step = Math.floor(N / C)
  let lastStep = N - step * (C - 1)

  console.log(
    "Sharing image generation across",
    C,
    "processes. Each process will generate",
    step,
    "images in",
    imgDir
  )

  function worker(offset, count) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: {
          offset,
          count,
          width: W,
          height: H,
        },
      })
      worker.on("message", () => bar.tick())
      worker.on("error", reject)
      worker.on("exit", code => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Worker stopped with exit code ${code}`))
        }
      })
    })
  }

  const workers = []
  for (let i = 0; i < C; ++i) {
    workers.push(worker(i * step, i === C - 1 ? lastStep : step))
  }

  const bar = new ProgressBar(
    `[:bar] :current/${N} | :percent | :elapsed sec | :rate /s | :eta secs remaining`,
    {
      total: N,
      width: 30,
      renderThrottle: 50,
    }
  )

  return Promise.all(workers)
}

function incrementallyRegenerateNoWorkers() {
  const count = fs.readdirSync(imgDir).length
  if (count === 0 && N > 1000) {
    if (C === 0) {
      console.log(
        "Going to use one core for image generation. Consider using `C=4 W=" +
          W +
          " H=" +
          H +
          " N=" +
          N +
          " node gen.js` to spread the work over 4 workers (or whatever)."
      )
      if (typeof Worker === "undefined") {
        console.log(
          "This also requires a newer verseion of nodejs (one that supports `worker_threads`)"
        )
      }
    } else {
      console.log(
        "This is going to be expensive. Consider using a different node version to generate the pool first."
      )
    }
  } else if (N - count > 1000) {
    if (C === 0) {
      console.log(
        "Going to incrementally fill the pool by " +
          (N - count) +
          " images single threaded."
      )
      console.log(
        "Consider using `C=4 W=" +
          W +
          " H=" +
          H +
          " N=" +
          N +
          " node gen.js` to spread the work over 4 workers (or whatever)."
      )
    } else {
      console.log(
        "This is going to be expensive. Consider using a different node version to regenerate the whole pool first."
      )
    }
  }

  const bar = new ProgressBar(
    `[:bar] :current/${N} | :percent | :elapsed sec | :rate /s | :eta secs remaining`,
    {
      total: N,
      width: 30,
      renderThrottle: 100,
    }
  )

  bar.tick(Math.min(N, count))

  // This is a controlled environment. Assume that all existing files represent that many images.
  // If N is larger than that, add that many images to the pool first.
  for (let i = count; i < N; ++i) {
    genJpg.generateImage(W, H, 80, function (err, image) {
      fs.writeFileSync(path.join(imgDir, i + ".jpg"), image.data)
    })
    bar.tick()
  }
  bar.terminate()

  // At this point the image dir should contain sufficient images to cover the articles
  // Each image has random noise and should be named "i.jpg", with i from 0 through N-1

  return Promise.resolve()
}

function generateArticles() {
  // Assuming there now exists a pool of images of given dimensions, generate an article and copy
  // an image per article and give it the same name.

  console.log("Generating", N, "articles with one", W, "x", H, "jpg image")

  const bar = new ProgressBar(
    `[:bar] :current/${N} | :percent | :elapsed sec | :rate /s | :eta secs remaining`,
    {
      total: N,
      width: 30,
      renderThrottle: 50,
    }
  )

  rimraf.sync("./generated_articles")
  rimraf.sync("./generated_images")
  fs.mkdirSync("./generated_articles", { recursive: true })
  fs.mkdirSync("./generated_images", { recursive: true })

  for (let i = 0; i < N; ++i) {
    const sentence = faker.lorem.sentence()
    const slug = faker.helpers.slugify(sentence).toLowerCase()
    fs.writeFileSync(
      path.join("./generated_articles", slug + ".md"),
      createArticle(i, sentence, slug)
    )
    fs.copyFileSync(
      path.join(imgDir, i + ".jpg"),
      path.join("./generated_images", slug + ".jpg")
    )
    bar.tick()
  }
  bar.terminate()

  console.log("Finished preparing " + N + " articles")
}

function createArticle(n, sentence, slug) {
  const desc = faker.lorem.sentence()

  return `---
articleNumber: ${n}
title: "${sentence.replace(/"/g, '\\"')}"
description: "${desc.replace(/"/g, '\\"')}"
slug: '${slug}'
date: ${faker.date.recent(1000).toISOString().slice(0, 10)}
rngImg: ../generated_images/${slug}.jpg
---

# ${sentence}

> ${desc}

${faker.lorem.paragraphs(2)}
`
}
