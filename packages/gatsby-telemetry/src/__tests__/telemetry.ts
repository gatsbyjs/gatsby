jest.mock(`../event-storage`)
const eventStore = require(`../event-storage`)
const Telemetry = require(`../telemetry`)

let telemetry
beforeEach(() => {
  eventStore.mockReset()
  telemetry = new Telemetry()
})

describe(`Telemetry`, () => {
  it(`Adds event to store`, () => {
    telemetry.buildAndStoreEvent(`demo`, {})
    expect(eventStore).toHaveBeenCalledTimes(1)
    expect(eventStore.mock.instances[0].addEvent).toHaveBeenCalledTimes(1)
  })

  it(`Doesn't add event to store if telemetry tracking is turned off`, () => {
    telemetry.trackingEnabled = false
    telemetry.trackActivity(`demo`)
    expect(eventStore.mock.instances[0].addEvent).not.toHaveBeenCalled()
  })
})
