import React, { useContext, useState } from "react"

const InputContext = React.createContext({})

export const useInputByUuid = uuid => {
  const context = useContext(InputContext)
  const data = context[uuid] || {}
  return { update: context.update, data }
}

export const useUuidUpdate = uuid => {
  const { update } = useContext(InputContext)
  return update(uuid)
}

export const InputProvider = ({ children, value: initialValue }) => {
  const [value, setValue] = useState(initialValue)

  const update = uuid => data => {
    setValue({
      ...value,
      [uuid]: data,
    })
  }

  return (
    <InputContext.Provider value={{ ...value, update }}>
      {children}
    </InputContext.Provider>
  )
}
