import helmet from "react-helmet"

exports.onRenderBody = ({ headComponents, ...otherProps }, pluginOptions) => {
  return {
    ...otherProps,
    headComponents: headComponents.concat([
      helmet.title.toComponent(),
      helmet.meta.toComponent(),
      helmet.link.toComponent(),
    ]),
  }
}
