// This fixture is moved during the test lifecycle

const helloDefaultCJS = require(`./cjs-default.js`)
const { helloNamedCJS } = require(`./cjs-named.js`)

helloDefaultCJS()
helloNamedCJS()

exports.onPreBuild = () => {
  console.info(`gatsby-node-cjs-on-pre-build`);
};
