const path = require(`path`)

exports.onCreateBabelConfig = ({ actions }) => {
  // rewrites import { get }from 'lodash' into import get from 'lodash/get';
  actions.setBabelPlugin({
    name: `babel-plugin-lodash`,
  })
}

exports.onCreateWebpackConfig = function onCreateWebpackConfig({
  stage,
  actions,
}) {
  const objectAssignStub = path.join(__dirname, `polyfills/object-assign.js`)

  if (stage === `build-html` || stage === `develop-html`) {
    actions.setWebpackConfig({
      resolve: {
        alias: {
          // These files are already polyfilled so these should return in a no-op
          // Stub Package: object.assign & object-assign
          "object.assign": objectAssignStub,
          "object-assign$": objectAssignStub,
          "@babel/runtime/helpers/extends.js$": objectAssignStub,
        },
      },
    })
    return
  }

  const noOp = path.join(__dirname, `polyfills/no-op.js`)
  const fetchStub = path.join(__dirname, `polyfills/fetch.js`)
  const whatwgFetchStub = path.join(__dirname, `polyfills/whatwg-fetch.js`)

  actions.setWebpackConfig({
    resolve: {
      alias: {
        // These files are already polyfilled so these should return in a no-op
        // Stub Package: object.assign & object-assign
        "object.assign": objectAssignStub,
        "object-assign$": objectAssignStub,
        "@babel/runtime/helpers/extends.js$": objectAssignStub,
        // Stub package: fetch
        unfetch$: fetchStub,
        "unfetch/polyfill$": noOp,
        "isomorphic-unfetch$": fetchStub,
        "whatwg-fetch$": whatwgFetchStub,
        // Stub package: url-polyfill
        "url-polyfill$": noOp,
      },
    },
  })
}
