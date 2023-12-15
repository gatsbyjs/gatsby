const path = require(`path`)
const os = require(`os`)

const verdaccioConfig = {
  storage: path.join(os.tmpdir(), `verdaccio`, `storage`),
  port: 4873, // default
  max_body_size: `1000mb`,
  web: {
    enable: true,
    title: `gatsby-dev`,
  },
  self_path: `./`,
  logs: { type: `stdout`, format: `pretty-timestamped`, level: `warn` },
  packages: {
    "**": {
      access: `$all`,
      publish: `$all`,
      proxy: `npmjs`,
    },
  },
  uplinks: {
    npmjs: {
      url: `https://registry.npmjs.org/`,
      // default is 2 max_fails - on flaky networks that cause a lot of failed installations
      max_fails: 10,
    },
  },
}

exports.verdaccioConfig = verdaccioConfig

const registryUrl = `http://localhost:${verdaccioConfig.port}`

exports.registryUrl = registryUrl
