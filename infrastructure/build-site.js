const shell = require("shelljs")
const { spawn } = require("child_process")
const path = require("path")
const GraphQLClient = require("graphql-request").GraphQLClient
const queue = require(`async/queue`)
const s3 = require("s3")

const commitId = process.env.CODEBUILD_SOURCE_VERSION

const s3Client = s3.createClient({
  s3Options: {
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    region: "us-east-1",
    endpoint: "s3.us-east-1.amazonaws.com",
  },
})

const client = new GraphQLClient(
  "https://api.graph.cool/simple/v1/cj8xuo77f0a3a0164y7jketkr",
  {
    headers: {
      Authorization: `Bearer ${process.env.GRAPHCOOL_TOKEN}`,
    },
  }
)

function createBuild(sha, commitObjId, url) {
  return client.request(`
    mutation {
      createBuild(gitSha: "${sha}", result: BUILDING, url: "${url}", commitId: "${commitObjId}", logsIds: []) {
        id
      }
    }
  `)
}

function updateBuild(buildId, status) {
  return client.request(`
    mutation {
      updateBuild(id: "${buildId}", result: ${status}) {
        id
      }
    }
  `)
}

function createLogLine(logLine, buildId, stderr = false) {
  return client.request(
    `
    mutation createLogLine($text: String!, $buildId: ID!, $stderr: Boolean) {
      createLogLine(text: $text, buildId: $buildId, stderr: $stderr) {
        id
      }
    }
  `,
    { text: logLine, buildId, stderr }
  )
}

const getCommitObjectByHash = commitId => {
  return client
    .request(
      `
      {
        allCommits(
          filter: { hash: "46f5ed9d8d05a9608bc9c98fcb5867a892149e94" }
        ) {
          id
        }
      }
    `
    )
    .then(result => result.allCommits[0].id)
}

console.log(process.env)

var q = queue(function({ logLine, buildId, stderr }, callback) {
  createLogLine(logLine, buildId, stderr).then(callback)
}, 1)

const Main = async () => {
  if (!process.env.PATH_TO_SITE) {
    console.log("Missing required environment variable PATH_TO_SITE")
    process.exit(1)
  }

  console.log(process.cwd())

  // Navigate to Gatsby directory
  shell.cd(`/gatsby/`)

  // Ensure we have the latest code
  shell.exec(`git fetch`)

  // Check if the commit exists (later we'll grab pull requests as well
  // but we're just building branches on gatsbyjs/gatsby while testing)
  const commitExists = shell.exec(`git cat-file -e ${commitId}`)
  console.log(`commitExists`, commitExists)
  if (commitExists.code !== 0) {
    process.exit(commitExists.code)
  }

  // It does! So let's checkout our commit and initialize the environment.
  shell.exec(`git checkout -b newbranch ${commitId}`)
  shell.exec(`yarn bootstrap`)

  // Now go to the site and install
  const pathToSite = path.join(`/gatsby/`, process.env.PATH_TO_SITE)
  shell.cd(pathToSite)
  shell.exec(`yarn`)
  shell.exec(`gatsby-dev --scan-once --quiet`)

  // Create the build
  const commitObjId = await getCommitObjectByHash(commitId)
  const url = `${process.env.PATH_TO_SITE}---${commitId}.gatsbydev.com`
  const result = await createBuild(commitId, commitObjId, url)
  const buildId = result.createBuild.id

  // Start building!
  const child = spawn(`gatsby`, [`build`])
  child.on(`error`, err => console.log(`err:`, err))
  child.stdout.pipe(process.stdout)
  child.stderr.pipe(process.stderr)
  child.stdout.on("data", data => {
    // Create new logline
    q.push({ logLine: data.toString("utf8"), buildId })
  })
  child.stderr.on("data", data => {
    // Create new logline
    q.push({ logLine: data.toString("utf8"), buildId, stderr: true })
  })

  // On end
  child.on("exit", (code, signal) => {
    console.log(
      "child process exited with " + `code ${code} and signal ${signal}`
    )
    // Gatsby build failed
    if (code !== 0) {
      updateBuild(buildId, "FAILURE")
      process.exit(code)
    }
    const publicDir = `${pathToSite}/public`
    console.log(`uploading files from ${publicDir}`)

    // 1. Push built files to s3 bucket
    const upload = s3Client.uploadDir({
      localDir: publicDir,
      s3Params: {
        Prefix: url,
        Bucket: `gatsby-js-builds`,
      },
    })
    upload.on(`fileUploadEnd`, () =>
      console.log(`${upload.progressAmount / upload.progressTotal}`)
    )
    upload.on(`error`, error => {
      console.error(error)
      updateBuild(buildId, "FAILURE").then(() => {
        process.exit(code)
      })
    })
    // 2. Write final status of build and exit.
    upload.on(`end`, () => {
      updateBuild(buildId, "SUCCESS").then(() => process.exit())
    })
  })
}

Main()
