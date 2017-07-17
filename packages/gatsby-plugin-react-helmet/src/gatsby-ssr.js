import Helmet from "react-helmet"

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  const helmet = Helmet.renderStatic()
  setHeadComponents([
    helmet.title.toComponent(),
    helmet.link.toComponent(),
    helmet.meta.toComponent(),
    helmet.noscript.toComponent(),
    helmet.script.toComponent(),
    helmet.style.toComponent(),
  ])
}
