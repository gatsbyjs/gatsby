import {
  memo,
  type JSX,
  useState,
  createContext,
  useLayoutEffect,
  type PropsWithChildren,
  type ComponentType,
} from "react";
import { getStore, onLogAction } from "../../redux";
import type { IGatsbyCLIState, ActionsUnion, ILog } from "../../redux/types";
import type { IRenderPageArgs } from "../../types";
import { Actions } from "../../constants";

type IStoreStateContext = {
  logs: IGatsbyCLIState;
  messages: Array<ILog>;
  pageTree: IRenderPageArgs | null;
};

export const StoreStateContext = createContext<IStoreStateContext>({
  ...getStore().getState(),
  messages: [],
});

function _StoreStateProvider({ children }: PropsWithChildren): JSX.Element {
  const [state, setState] = useState<IStoreStateContext>({
    ...getStore().getState(),
    messages: [],
  });

  useLayoutEffect(() => {
    return onLogAction((action: ActionsUnion): void => {
      if (action.type === Actions.Log) {
        setState((state) => {
          return {
            ...state,
            messages: [...state.messages, action.payload],
          };
        });
      } else {
        setState((state) => {
          return { ...getStore().getState(), messages: state.messages };
        });
      }
    });
  }, []);

  return (
    <StoreStateContext.Provider value={state}>
      {children}
    </StoreStateContext.Provider>
  );
}

export const StoreStateProvider: ComponentType<PropsWithChildren> =
  memo(_StoreStateProvider);
