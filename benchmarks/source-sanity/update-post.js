require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

const client = require('@sanity/client')({
  projectId: process.env.GATSBY_SANITY_PROJECT_ID,
  dataset: process.env.GATSBY_SANITY_DATASET,
  token: process.env.GATSBY_SANITY_WRITE_TOKEN,
  useCdn: false
})

const randomDoc = Math.floor(Math.random() * (Number(process.env.GATSBY_SANITY_DATASET) || 512))

console.log(`Getting article number ${randomDoc}`)

client
  .fetch(`*[$randomDoc]`, {randomDoc})
  .then(({_id, title}) => {
    client.patch(_id).set({title: title + '!'})
  })
  .then(result => console.log(`The "${result.title}" was updated!`))
  .catch(error => console.error(error))
