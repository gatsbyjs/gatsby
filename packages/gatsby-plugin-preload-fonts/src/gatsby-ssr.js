const React = require(`react`)

// TODO: implement stub

exports.onRenderBody = (
  { setHeadComponents, pathname = `/` },
  pluginOptions
) => {
  const href = `#`
  const uid = `some_unique_id`

  setHeadComponents([<link preload key={uid} href={href} />])
}
