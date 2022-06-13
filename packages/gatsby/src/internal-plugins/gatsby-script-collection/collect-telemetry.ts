import telemetry from "gatsby-telemetry"
import { ScriptStrategy, ScriptProps, resolveInlineScript } from "gatsby-script"

export enum ScriptTelemetryLabel {
  strategy = `GATSBY_SCRIPT_STRATEGY`,
  type = `GATSBY_SCRIPT_TYPE`,
  callbacks = `GATSBY_SCRIPT_CALLBACKS`,
}

export enum ScriptTelemetryType {
  src = `SCRIPT_WITH_SRC`,
  inline = `INLINE_SCRIPT`,
}

export function collectTelemetry(props: ScriptProps = {}): void {
  const { src, strategy = ScriptStrategy.postHydrate, onLoad, onError } = props
  const inlineScript = resolveInlineScript(props)

  telemetry.trackCli(ScriptTelemetryLabel.strategy, {
    name: `gatsby-script strategy`,
    valueString: strategy,
  })

  let type: ScriptTelemetryType | `UNKNOWN` = `UNKNOWN`

  if (src) {
    type = ScriptTelemetryType.src
  } else if (inlineScript) {
    type = ScriptTelemetryType.inline
  }

  if (type !== `UNKNOWN`) {
    telemetry.trackCli(ScriptTelemetryLabel.type, {
      name: `gatsby-script type`,
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
    telemetry.trackCli(ScriptTelemetryLabel.callbacks, {
      name: `gatsby-script callbacks`,
      valueStringArray: callbacks,
    })
  }
}
