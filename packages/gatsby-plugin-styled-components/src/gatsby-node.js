// Add Babel plugin
let babelPluginExists = false
try {
  require.resolve(`babel-plugin-styled-components`)
  babelPluginExists = true
} catch (e) {
  // Ignore
}

exports.modifyBabelrc = ({ babelrc, stage }) => {
  if (babelPluginExists) {
    if (stage === `build-html`) {
      return {
        ...babelrc,
        plugins: babelrc.plugins.concat([
          [
            `babel-plugin-styled-components`,
            {
              ssr: true,
            },
          ],
        ]),
      }
    }

    return {
      ...babelrc,
      plugins: babelrc.plugins.concat([`babel-plugin-styled-components`]),
    }
  }

  return babelrc
}
