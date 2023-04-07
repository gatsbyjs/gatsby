const React = require("react")
const { ContextA, ContextB } = require("./src/contexts")
const { data } = require("./shared-data/head-function-export")

const WrapRootElement = ({ element }) => {
  const { contextA, contextB } = data.contextValues

  return (
    <div className="Will_be_removed_in_Head__you_should_only_use_providers_in_wrapRootElement">
      <ContextA.Provider value={contextA}>
        <ContextB.Provider value={contextB}>
          <div className="Will_be_removed_in_Head__you_should_only_use_providers_in_wrapRootElement">
            {element}
          </div>
        </ContextB.Provider>
      </ContextA.Provider>
    </div>
  )
}

exports.wrapRootElement = ({ element }) => <WrapRootElement element={element} />
