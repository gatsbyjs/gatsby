import helmet from "react-helmet"

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  setHeadComponents([
    helmet.title.toComponent(),
    helmet.meta.toComponent(),
    helmet.link.toComponent(),
  ])
}
