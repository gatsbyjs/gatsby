const React = require(`react`)
const styletron = require(`./index`)
const { Provider } = require(`styletron-react`)

// eslint-disable-next-line react/prop-types
exports.wrapRootElement = ({ element }, options) => (
  <Provider value={styletron(options).instance}>{element}</Provider>
)

exports.onRenderBody = ({ bodyComponent, setHeadComponents }, options) => {
  const instance = styletron(options).instance

  const stylesheets = instance.getStylesheets()
  const headComponents = stylesheets[0].css
    ? stylesheets.map((sheet, index) => (
        <style
          className="_styletron_hydrate_"
          dangerouslySetInnerHTML={{
            __html: sheet.css,
          }}
          key={index}
          media={sheet.attrs.media}
        />
      ))
    : null

  setHeadComponents(headComponents)
}
