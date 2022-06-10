import { isTrackingEnabled, trackCli } from "gatsby-telemetry"
import { ScriptStrategy, ScriptProps } from "./gatsby-script"

export enum ScriptTelemetryLabel {
  strategy = `GATSBY_SCRIPT_STRATEGY`,
  type = `GATSBY_SCRIPT_TYPE`,
  callbacks = `GATSBY_SCRIPT_CALLBACKS`,
}

export enum ScriptTelemetryType {
  src = `SCRIPT_WITH_SRC`,
  inline = `INLINE_SCRIPT`,
}

export function collectTelemetry(
  props: ScriptProps = {},
  inlineScript: string
): void {
  if (!isTrackingEnabled()) {
    return
  }

  const { src, strategy = ScriptStrategy.postHydrate, onLoad, onError } = props

  trackCli(ScriptTelemetryLabel.strategy, {
    valueString: strategy,
  })

  let type: ScriptTelemetryType | `UNKNOWN` = `UNKNOWN`

  if (src) {
    type = ScriptTelemetryType.src
  } else if (inlineScript) {
    type = ScriptTelemetryType.inline
  }

  if (type !== `UNKNOWN`) {
    trackCli(ScriptTelemetryLabel.type, {
      valueString: type,
    })
  }

  const callbacks: Array<string> = []

  if (onLoad) {
    callbacks.push(`onLoad`)
  }
  if (onError) {
    callbacks.push(`onError`)
  }

  if (callbacks.length) {
    trackCli(ScriptTelemetryLabel.callbacks, {
      valueStringArray: callbacks,
    })
  }
}
