const React = require("react")
const { context, ContextB } = require("./src/contexts")
const { data } = require("./shared-data/head-function-export")

const WrapRootElement = ({ element }) => {
  const { context, contextB } = data.contextValues

  return (
    <div className="Will_be_removed_in_Head__you_should_only_use_providers_in_wrapRootElement">
      <context.Provider value={context}>
        <ContextB.Provider value={contextB}>
          <div className="Will_be_removed_in_Head__you_should_only_use_providers_in_wrapRootElement">
            {element}
          </div>
        </ContextB.Provider>
      </context.Provider>
    </div>
  )
}

exports.wrapRootElement = ({ element }) => <WrapRootElement element={element} />
