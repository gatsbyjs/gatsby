var aws4 = require(`hyper-aws4`)
var fetch = require(`node-fetch`)
var Hyper = require(`hyper-api`)

let api = new Hyper({
  credential: {
    accessKey: process.env.hyperAccessKey,
    secretKey: process.env.hyperSecretKey,
  },
})

module.exports = ({ pathToSite, commit }) => {
  const config = {
    Env: [
      `PATH_TO_SITE=${pathToSite}`,
      `GRAPHCOOL_TOKEN=${process.env.GRAPHCOOL_TOKEN}`,
      `CODEBUILD_SOURCE_VERSION=${commit}`,
      `COMMIT=${commit}`,
      `accessKeyId=${process.env.accessKeyId}`,
      `secretAccessKey=${process.env.secretAccessKey}`,
    ],
    Image: `gatsbyjs/gatsby-dev-builds`,
    Labels: {
      sh_hyper_instancetype: `m2`,
    },
  }

  api
    .post(`/containers/create`, config)
    .then(c => {
      console.log(c)
      setTimeout(() => {
        api
          .post(`/containers/${c.Id}/start`)
          .then(c => console.log(c))
          .catch(e => console.log(e))
      }, 2000)
      // TODO attach then once it's stopped, delete the job.
    })
    .catch(e => console.log(e))
}
