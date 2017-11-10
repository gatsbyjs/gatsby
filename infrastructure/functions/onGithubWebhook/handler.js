// handler.js

"use strict"
const axios = require("axios")
const Libhoney = require("libhoney").default
const flatten = require("flat")
const GraphQLClient = require("graphql-request").GraphQLClient

const hny = new Libhoney({
  writeKey: process.env.HONEYCOMB_KEY,
  dataset: "gatsbyjs-os.lambda.github-webhook",
})

const client = new GraphQLClient(
  "https://api.graph.cool/simple/v1/cj8xuo77f0a3a0164y7jketkr",
  {
    headers: {
      Authorization: process.env.GRAPHCOOL_TOKEN,
    },
  }
)

function createBranch(branch) {
  hny.sendNow({ createBranch: branch })
  return client.request(`
    {
      createBranch(name: "${branch}", commits: []) {
        id
      }
    }
  `)
}

function getBranch(branch) {
  return client.request(`
    {
      allBranches(filter: {name: "${branch}"}) {
        id
        name
      }
    }
  `)
}

const createBranchIfDoesNotExist = branch =>
  getBranch(branch).then(result => {
    if (result.allBranches.length === 0) {
      return createBranch(branch).then(
        newBranch => newBranch.data.createBranch.id
      )
    } else {
      return result.allBranches[0].id
    }
  })

const createCommit = (commit, branchId) => {
  hny.sendNow({ createCommit: true, branchId, ...commit })
  return client.request(`
    {
      createCommit(author: "${commit.author}", hash: "${commit.sha}", message: "${commit.message}", branchIds: [${branchId}]) {
        id
      }
    }
  `)
}

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

  new Promise(resolve => {
    // Commit push
    if (
      event.headers[`X-GitHub-Event`] === `push` &&
      event.body.ref.split(`/`)[1] === `heads`
    ) {
      const branchName = event.body.ref.split(`/`)[2]

      // Check if the branch exists
      createBranchIfDoesNotExist(branchName).then(branchId => {
        // Create commits
        resolve(
          Promise.all(
            event.body.commits.map(commit => createCommit(commit, branchId))
          )
        )
      })
    }
  }).then(() => callback(null, response))
}
