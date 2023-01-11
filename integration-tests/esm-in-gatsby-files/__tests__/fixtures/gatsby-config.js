// This fixture is moved during the test lifecycle

const helloDefaultCJS = require(`./cjs-default.js`)
const { helloNamedCJS } = require(`./cjs-named.js`)

helloDefaultCJS()
helloNamedCJS()

const config = {
  plugins: [
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-cjs`,
          }
        ]
      },
    },
  ],
}

module.exports = config