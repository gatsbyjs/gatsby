require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || 'development'}`,
})

const Cosmic = require('cosmicjs')

const bucket = Cosmic().bucket({
  slug: process.env.BENCHMARK_COSMIC_BUCKET,
  read_key: process.env.BENCHMARK_COSMIC_READ_KEY,
  write_key: process.env.BENCHMARK_COSMIC_WRITE_KEY
})

const DATASET = (Number(process.env.BENCHMARK_COSMIC_DATASET) || 512)

const randomDoc = Math.floor(Math.random() * DATASET)

console.log(`Getting article number ${randomDoc}`)

const run = async () => {
  const { objects } = await bucket.getObjects({
    skip: randomDoc,
    limit: 1,
    props: 'slug,title'
  })
  if (objects && objects.length > 0) {
    const { slug, title } = objects[0];
    await bucket.editObject({
      slug,
      title: `${title}!`,
      trigger_webhook: true
    })
    console.log(`Updated article number ${randomDoc}`)
  }
}
run();
