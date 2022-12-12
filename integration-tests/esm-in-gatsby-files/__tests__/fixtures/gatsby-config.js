// This fixture is moved during the test lifecycle

const helloDefaultCJS = require(`./cjs-default.js`)
const { helloNamedCJS } = require(`./cjs-named.js`)

helloDefaultCJS()
helloNamedCJS()

const config = {
  plugins: [],
}

module.exports = config