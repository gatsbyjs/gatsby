import { Helmet } from "react-helmet"

export const onRenderBody = ({
  setHeadComponents,
  setHtmlAttributes,
  setBodyAttributes,
}) => {
  const helmet = Helmet.renderStatic()
  // These action functions were added partway through the Gatsby 1.x cycle.
  if (setHtmlAttributes) {
    setHtmlAttributes(helmet.htmlAttributes.toComponent())
  }
  if (setBodyAttributes) {
    setBodyAttributes(helmet.bodyAttributes.toComponent())
  }
  setHeadComponents([
    helmet.title.toComponent(),
    helmet.link.toComponent(),
    helmet.meta.toComponent(),
    helmet.noscript.toComponent(),
    helmet.script.toComponent(),
    helmet.style.toComponent(),
    helmet.base.toComponent(),
  ])
}

export const onPreRenderHTML = ({
  getHeadComponents,
  replaceHeadComponents,
}) => {
  const headComponents = getHeadComponents()

  const groupedByType = headComponents.reduce((hash, obj) => {
    if (obj.type === undefined) return hash
    return Object.assign(hash, {
      [obj.type]: (hash[obj.type] || []).concat(obj),
    })
  }, {})

  replaceHeadComponents([
    ...groupedByType.title,
    ...groupedByType.base,
    ...groupedByType.meta,
    ...groupedByType.style,
    ...groupedByType.link,
    ...groupedByType.script,
    ...groupedByType.noscript,
  ])
}
