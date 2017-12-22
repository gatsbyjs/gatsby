var aws4 = require("hyper-aws4")
var fetch = require("node-fetch")
var Hyper = require("hyper-api")

let api = new Hyper({
  credential: {
    accessKey: process.env.hyperAccessKey,
    secretKey: process.env.hyperSecretKey,
  },
})

const config = {
  Env: [
    `PATH_TO_SITE=${process.env.PATH_TO_SITE}`,
    `GRAPHCOOL_TOKEN=${process.env.GRAPHCOOL_TOKEN}`,
    `CODEBUILD_SOURCE_VERSION=${process.env.COMMIT}`,
    `accessKeyId=${process.env.accessKeyId}`,
    `secretAccessKey=${process.env.secretAccessKey}`,
  ],
  Image: "gatsbyjs/gatsby-dev-builds",
  Labels: {
    sh_hyper_instancetype: "m2",
  },
}

api
  .post("/containers/create", config)
  .then(c => {
    console.log(c)
    setTimeout(() => {
      api
        .post(`/containers/${c.Id}/start`)
        .then(c => console.log(c))
        .catch(e => console.log(e))
    }, 2000)
  })
  .catch(e => console.log(e))
