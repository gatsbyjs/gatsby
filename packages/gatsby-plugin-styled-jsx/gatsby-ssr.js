exports.onRenderBody = ({setHeadComponents}, pluginOptions) => {
  if (process.env.NODE_ENV === `production`) {
    const flush = require('styled-jsx/server').default
    const css = flush()
    setHeadComponents([css])
  }
}
