import React, { EffectCallback } from "react"
import io from "socket.io-client"
import { useServices } from "../components/services-provider"

type RestartState = "idle" | "needs-restart" | "is-restarting"

type RestartFn = () => void

function useDevelopState(): [RestartState, RestartFn] {
  const [state, setState] = React.useState<RestartState>(`idle`)
  const [socket, setSocket] = React.useState<ReturnType<typeof io> | null>(null)

  const restartFn = (): RestartFn => (): void => {
    if (!socket) return

    setState(`is-restarting`)
    socket.emit(`develop:restart`)
  }

  const services = useServices()
  React.useEffect(() => {
    if (!services.developstatusserver) return

    setSocket(
      io(
        `${window.location.protocol}//${window.location.hostname}:${services.developstatusserver.port}`
      )
    )
  }, [services])

  React.useEffect((): ReturnType<EffectCallback> => {
    // NOTE(@mxstbr): Have to return a function here, otherwise eslint complains.
    if (!socket) return (): void => {}

    const structuredLogHandler = (msg): void => {
      if (
        msg.type === `LOG_ACTION` &&
        msg.action.type === `DEVELOP` &&
        msg.action.payload === `RESTART_REQUIRED`
      ) {
        setState(`needs-restart`)
      }

      if (
        state === `is-restarting` &&
        msg.type === `LOG_ACTION` &&
        msg.action.type === `SET_STATUS` &&
        msg.action.payload === `SUCCESS`
      ) {
        setState(`idle`)
      }
    }

    socket.on(`structured-log`, structuredLogHandler)

    return (): void => {
      socket.removeListener(`structured-log`, structuredLogHandler)
    }
  }, [socket, state])

  return [state, restartFn]
}

export default useDevelopState
