import {
  DefaultContext,
  Interpreter,
  Actor,
  State,
  AnyEventObject,
} from "xstate"
import reporter from "gatsby-cli/lib/reporter"

type AnyInterpreterWithContext<T> = Interpreter<T, any, any, any, any>

const isInterpreter = <T>(
  actor: Actor<T> | Interpreter<T>
): actor is Interpreter<T> => `machine` in actor

export function logTransitions<T = DefaultContext>(
  service: AnyInterpreterWithContext<T>
): void {
  const listeners = new WeakSet()
  let last: State<T, AnyEventObject, any, any>

  service.onTransition(state => {
    if (!last) {
      last = state
    } else if (!state.changed || last.matches(state)) {
      return
    }
    last = state
    if (process.env.gatsby_log_level === `verbose`) {
      reporter.verbose(`Transition to ${JSON.stringify(state.value)}`)
    }
    // eslint-disable-next-line no-unused-expressions
    service.children?.forEach(child => {
      // We want to ensure we don't attach a listener to the same
      // actor. We don't need to worry about detaching the listener
      // because xstate handles that for us when the actor is stopped.

      // @ts-ignore - TODO: Fix it
      if (isInterpreter(child) && !listeners.has(child)) {
        let sublast = child.state
        child.onTransition(substate => {
          if (!sublast) {
            sublast = substate
          } else if (!substate.changed || sublast.matches(substate)) {
            return
          }
          sublast = substate
          if (process.env.gatsby_log_level === `verbose`) {
            reporter.verbose(
              `Transition to ${JSON.stringify(state.value)} > ${JSON.stringify(
                substate.value
              )}`
            )
          }
        })
        listeners.add(child)
      }
    })
  })
}
