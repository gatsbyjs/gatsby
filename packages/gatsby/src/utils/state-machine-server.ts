import WebSocket from "ws"
import { Interpreter } from "xstate"
// TODO: run this through express on the same port as Gatsby
export const startStateMachineServer = (
  service: Interpreter<any>,
  port: number
): WebSocket.Server => {
  const wss = new WebSocket.Server({ port })

  const { machine } = service

  wss.on(`connection`, ws => {
    console.log(`WS`)

    ws.on(`open`, () => {
      console.log(`open`)
    })

    ws.on(`message`, (msg: WebSocket.Data) => {
      if (typeof msg !== `string`) {
        return
      }
      const message = JSON.parse(msg)
      if (message?.type === `GET_MACHINE`) {
        ws.send(
          JSON.stringify({
            event: `SET_MACHINE`,
            config: machine.config,
            options: machine.options,
            state: service.state.value,
          })
        )
      }
    })
    let last = service.state
    service.onTransition(async context => {
      if (context.changed && !last.matches(context)) {
        if (ws.readyState === WebSocket.OPEN) {
          last = context
          console.log(`sending message`, context.value)
          ws.send(
            JSON.stringify({
              event: `SET_STATE`,
              state: context.value,
              timestamp: Date.now(),
            })
          )
        }
      }
    })
  })
  return wss
}
