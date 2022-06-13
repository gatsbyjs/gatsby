import {
  collectTelemetry,
  ScriptTelemetryLabel,
  ScriptTelemetryType,
} from "../collect-telemetry"
import { ScriptStrategy } from "gatsby-script"
import { trackCli, isTrackingEnabled } from "gatsby-telemetry"

jest.mock(`gatsby-telemetry`, () => {
  const actual = jest.requireActual(`gatsby-telemetry`)
  return {
    ...actual,
    trackCli: jest.fn(),
    isTrackingEnabled: jest.fn(),
  }
})

// Assign mock function types
const isTrackingEnabledMock = isTrackingEnabled as jest.MockedFunction<
  typeof isTrackingEnabled
>
const trackCliMock = trackCli as jest.MockedFunction<typeof trackCli>

describe(`collectTelemetry`, () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it(`should collect ${ScriptTelemetryLabel.strategy} for post-hydrate scripts`, () => {
    isTrackingEnabledMock.mockImplementationOnce(() => true)
    collectTelemetry({})
    expect(trackCliMock).toHaveBeenCalledWith(ScriptTelemetryLabel.strategy, {
      valueString: ScriptStrategy.postHydrate,
    })
  })
  it(`should collect ${ScriptTelemetryLabel.strategy} for idle scripts`, () => {
    isTrackingEnabledMock.mockImplementationOnce(() => true)
    collectTelemetry({ strategy: ScriptStrategy.idle })
    expect(trackCliMock).toHaveBeenCalledWith(ScriptTelemetryLabel.strategy, {
      valueString: ScriptStrategy.idle,
    })
  })
  it(`should collect ${ScriptTelemetryLabel.strategy} for off-main-thread scripts`, () => {
    isTrackingEnabledMock.mockImplementationOnce(() => true)
    collectTelemetry({ strategy: ScriptStrategy.offMainThread })
    expect(trackCliMock).toHaveBeenCalledWith(ScriptTelemetryLabel.strategy, {
      valueString: ScriptStrategy.offMainThread,
    })
  })

  it(`should not collect ${ScriptTelemetryLabel.type} for scripts that are not scripts with sources or inline scripts`, () => {
    isTrackingEnabledMock.mockImplementationOnce(() => true)
    collectTelemetry({})
    expect(trackCliMock).not.toHaveBeenCalledWith(ScriptTelemetryLabel.type)
  })
  it(`should collect ${ScriptTelemetryLabel.type} for scripts with sources`, () => {
    isTrackingEnabledMock.mockImplementationOnce(() => true)
    collectTelemetry({ src: `/my-example-script.js` })
    expect(trackCliMock).toHaveBeenCalledWith(ScriptTelemetryLabel.type, {
      valueString: ScriptTelemetryType.src,
    })
  })
  it(`should collect ${ScriptTelemetryLabel.type} for inline scripts`, () => {
    isTrackingEnabledMock.mockImplementationOnce(() => true)
    collectTelemetry({
      dangerouslySetInnerHTML: { __html: `console.log('Hello world')` },
    })
    expect(trackCliMock).toHaveBeenCalledWith(ScriptTelemetryLabel.type, {
      valueString: ScriptTelemetryType.inline,
    })
  })

  it(`should not collect ${ScriptTelemetryLabel.callbacks} for scripts with no callbacks`, () => {
    isTrackingEnabledMock.mockImplementationOnce(() => true)
    collectTelemetry({})
    expect(trackCliMock).not.toHaveBeenCalledWith(
      ScriptTelemetryLabel.callbacks
    )
  })
  it(`should collect ${ScriptTelemetryLabel.callbacks} for scripts with only onLoad`, () => {
    isTrackingEnabledMock.mockImplementationOnce(() => true)
    collectTelemetry({ onLoad: () => {} })
    expect(trackCliMock).toHaveBeenCalledWith(ScriptTelemetryLabel.callbacks, {
      valueStringArray: [`onLoad`],
    })
  })
  it(`should collect ${ScriptTelemetryLabel.callbacks} for scripts with only onError`, () => {
    isTrackingEnabledMock.mockImplementationOnce(() => true)
    collectTelemetry({ onError: () => {} })
    expect(trackCliMock).toHaveBeenCalledWith(ScriptTelemetryLabel.callbacks, {
      valueStringArray: [`onError`],
    })
  })
  it(`should collect ${ScriptTelemetryLabel.callbacks} for scripts with onLoad and onError`, () => {
    isTrackingEnabledMock.mockImplementationOnce(() => true)
    collectTelemetry({ onLoad: () => {}, onError: () => {} })
    expect(trackCliMock).toHaveBeenCalledWith(ScriptTelemetryLabel.callbacks, {
      valueStringArray: [`onLoad`, `onError`],
    })
  })
})
