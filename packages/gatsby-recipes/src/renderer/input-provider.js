import React, { useContext, useState } from "react"

const InputContext = React.createContext({})

export const useInputByKey = key => {
  const context = useContext(InputContext) || {}
  const result = context[key]
  return result?.value
}

export const useInput = (key, sendEvent = () => {}) => {
  const contextVal = useInputByKey(key) || ``
  const [val, setVal] = useState(contextVal)

  const Input = ({ label = key, type = `text`, ...props }) => (
    <div>
      <label>{label}</label>
      <input
        {...props}
        type={type}
        value={val}
        onChange={e => {
          sendEvent({
            event: `INPUT_ADDED`,
            input: {
              key,
              value: e.target.value,
            },
          })
        }}
      />
    </div>
  )

  return [val, Input]
}

export const InputProvider = InputContext.Provider
