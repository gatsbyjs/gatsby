import React from "react"
import io from "socket.io-client"

type RestartState = "idle" | "needs-restart" | "is-restarting"

type RestartFn = () => void

const useDevelopRestart = (): [RestartState, RestartFn] => {
  const [state, setState] = React.useState<RestartState>(`idle`)
  const [restartFn, setRestartFn] = React.useState<RestartFn>(() => null)

  React.useEffect(() => {
    fetch(`/___services`)
      .then(res => res.json())
      .then(services => {
        if (services.developstatusserver) {
          const parentSocket = io(
            `${window.location.protocol}//${window.location.hostname}:${services.developstatusserver.port}`
          )

          setRestartFn(
            (): RestartFn => (): void => {
              setState(`is-restarting`)
              parentSocket.emit(`develop:restart`)

              parentSocket.once(`develop:started`, () => {
                setState(`idle`)
              })
            }
          )

          parentSocket.on(`develop:needs-restart`, () => {
            setState(`needs-restart`)
          })
        }
      })
  }, [])

  return [state, restartFn]
}

export default useDevelopRestart
