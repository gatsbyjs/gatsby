jest.mock(`../event-storage`)
import { EventStorage } from "../event-storage"
import { AnalyticsTracker } from "../telemetry"

let telemetry
beforeEach(() => {
  EventStorage.mockReset()
  telemetry = new AnalyticsTracker()
})

describe(`Telemetry`, () => {
  it(`Adds event to store`, () => {
    telemetry.buildAndStoreEvent(`demo`, {})
    expect(EventStorage).toHaveBeenCalledTimes(1)
    expect(EventStorage.mock.instances[0].addEvent).toHaveBeenCalledTimes(1)
  })

  it(`Doesn't add event to store if telemetry tracking is turned off`, () => {
    telemetry.trackingEnabled = false
    telemetry.trackActivity(`demo`)
    expect(EventStorage.mock.instances[0].addEvent).not.toHaveBeenCalled()
  })
})
