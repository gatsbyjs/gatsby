import React, { useContext, useState } from "react"

const InputContext = React.createContext({})

export const useInputByKey = key => {
  const context = useContext(InputContext) || {}
  const result = context[key]
  return result?.value
}

export const useInput = ({ type = `text`, label, key = `123` }) => {
  const contextVal = useInputByKey(key) || ``
  const [val, setVal] = useState(contextVal)

  const Input = props => (
    <div>
      <label>{label}</label>
      <input
        {...props}
        type={type}
        value={val}
        onChange={e => setVal(e.target.value)}
      />
    </div>
  )

  return [Input, val]
}

export const InputProvider = InputContext.Provider
