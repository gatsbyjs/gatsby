import React, {
  useState,
  useLayoutEffect,
  createContext,
  PropsWithChildren,
} from "react"
import { getStore, onLogAction } from "../../redux"
import { IGatsbyCLIState, ActionsUnion, ILog } from "../../redux/types"
import { IRenderPageArgs } from "../../types"
import { Actions } from "../../constants"

interface IStoreStateContext {
  logs: IGatsbyCLIState
  messages: Array<ILog>
  pageTree: IRenderPageArgs | null
}

const StoreStateContext = createContext<IStoreStateContext>({
  ...getStore().getState(),
  messages: [],
})

export const StoreStateProvider: React.FC<PropsWithChildren> = ({
  children,
}): React.ReactElement => {
  const [state, setState] = useState<IStoreStateContext>({
    ...getStore().getState(),
    messages: [],
  })

  useLayoutEffect(
    () =>
      onLogAction((action: ActionsUnion) => {
        if (action.type === Actions.Log) {
          setState(state => {
            return {
              ...state,
              messages: [...state.messages, action.payload],
            }
          })
        } else {
          setState(state => {
            return { ...getStore().getState(), messages: state.messages }
          })
        }
      }),
    []
  )

  return (
    <StoreStateContext.Provider value={state}>
      {children}
    </StoreStateContext.Provider>
  )
}

export default StoreStateContext
