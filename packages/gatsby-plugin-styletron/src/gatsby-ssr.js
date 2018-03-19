const React = require(`react`)
const StyletronProvider = require(`styletron-react`).Provider
const { renderToString } = require(`react-dom/server`)

exports.replaceRenderer = ({
  bodyComponent,
  setHeadComponents,
  replaceBodyHTMLString,
}, options) => {
  const StyletronContext = require(`./StyletronContext.js`)(options)

  const app = (
    <StyletronContext.Consumer>
      {value => (
        <StyletronProvider value={value}>{bodyComponent}</StyletronProvider>
      )}
    </StyletronContext.Consumer>
  )

  replaceBodyHTMLString(renderToString(app))

  const headComponents = (
    <StyletronContext.Consumer>
      {value => (
        <StyletronProvider value={value}>
          {value.getStylesheets().map((sheet, index) => (
            <style
              media={sheet.media}
              className="_styletron_hydrate_"
              key={index}
              dangerouslySetInnerHTML={{
                __html: sheet.css,
              }}
            />
          ))}
        </StyletronProvider>
      )}
    </StyletronContext.Consumer>
  )

  setHeadComponents(headComponents)
}
