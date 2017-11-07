// handler.js

"use strict"
const axios = require("axios")
const Libhoney = require("libhoney").default
const flatten = require("flat")

const hny = new Libhoney({
  writeKey: process.env.HONEYCOMB_KEY,
  dataset: "gatsbyjs-os.lambda.github-webhook",
})

module.exports.event = function(event, context, callback) {
  if (event && event.body) {
    event.body = JSON.parse(event.body)
  }
  console.log(event) // Contains incoming request data (e.g., query params, headers and more)
  hny.sendNow(flatten(event))

  const response = {
    statusCode: 200,
    body: ``,
  }

  callback(null, response)
}
