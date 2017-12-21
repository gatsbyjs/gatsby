const AWS = require(`aws-sdk`)
AWS.config.region = `us-east-1`
console.log(AWS.config)

const codebuild = new AWS.CodeBuild({ apiVersion: `2016-10-06` })

const key = `TESTING_CREATING_PROJECT3`

const params = {
  artifacts: {
    type: `NO_ARTIFACTS`,
  },
  environment: {
    type: `LINUX_CONTAINER`,
    image: `gatsbyjs/gatsby-dev-builds`,
    computeType: `BUILD_GENERAL1_SMALL`,
    privilegedMode: true,
  },
  name: key,
  source: {
    type: `GITHUB`,
    auth: {
      type: `OAUTH`,
    },
    buildspec: `infrastructure/buildspec.yml`,
    location: `https://github.com/gatsbyjs/gatsby.git`,
  },
  badgeEnabled: false,
  serviceRole: `arn:aws:iam::886436322012:role/CodeBuildServiceRoleGatsbyJSDev`,
  timeoutInMinutes: 15,
}

codebuild.createProject(params, function(err, data) {
  if (err)
    console.log(err, err.stack) // an error occurred
  else console.log(data) // successful response

  console.log(`WEBHOOK`)
  var params = {
    projectName: key /* required */,
  }
  codebuild.createWebhook(params, function(err, data) {
    if (err)
      console.log(err, err.stack) // an error occurred
    else console.log(data) // successful response
  })
})
