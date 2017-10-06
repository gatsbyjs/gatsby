import flush from "styled-jsx/server"
exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  if (process.env.NODE_ENV === `production`) {
    const css = flush()
    setHeadComponents([css])
  }
}
