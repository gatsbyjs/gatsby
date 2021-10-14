import { EventStorage } from "../event-storage"
import { AnalyticsTracker } from "../telemetry"
import * as fs from "fs-extra"
import * as os from "os"
import * as path from "path"
import { uuid } from "gatsby-core-utils"

const uuidv4 = uuid.v4

jest.mock(`../event-storage`)

let telemetry
beforeEach(() => {
  ;(EventStorage as jest.Mock).mockReset()
  telemetry = new AnalyticsTracker()
})

describe(`Telemetry`, () => {
  it(`Adds event to store`, () => {
    telemetry.buildAndStoreEvent(`demo`, {})
    expect(EventStorage).toHaveBeenCalledTimes(1)
    expect(
      (EventStorage as jest.Mock).mock.instances[0].addEvent
    ).toHaveBeenCalledTimes(2)
  })

  it(`Doesn't add event to store if telemetry tracking is turned off`, () => {
    ;(EventStorage as jest.Mock).mockReset()
    telemetry = new AnalyticsTracker({ trackingEnabled: false })
    telemetry.trackActivity(`demo`)
    expect(
      (EventStorage as jest.Mock).mock.instances[0].addEvent
    ).not.toHaveBeenCalled()
  })

  describe(`trackFeatureIsUsed`, () => {
    it(`Attaches feature list to the events`, () => {
      telemetry.trackFeatureIsUsed(`Foo:bar`)
      telemetry.buildAndStoreEvent(`demo`, {})
      expect(
        (EventStorage as jest.Mock).mock.instances[0].addEvent
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          features: [`Foo:bar`],
        })
      )
    })
  })

  describe(`allows overriding defaults`, () => {
    it(`allows overriding componentId`, () => {
      const t = new AnalyticsTracker({
        componentId: `desktop`,
        gatsbyCliVersion: `1.2.3-beta1`,
      })
      t.buildAndStoreEvent(`demo`, {})
      expect(
        (EventStorage as jest.Mock).mock.instances[1].addEvent
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          componentId: `desktop`,
          gatsbyCliVersion: `1.2.3-beta1`,
        })
      )
    })
  })

  describe(`allows reading tags from path`, () => {
    it(`getTagsFromPath should read the file and detect updates`, async () => {
      const t = new AnalyticsTracker({
        componentId: `component`,
      })

      // Test it when env not set
      let res = t.getTagsFromPath()
      expect(res).toMatchObject({})
      expect(t.lastEnvTagsFromFileTime).toBe(0)

      // create file and write initial data
      const filePath = path.join(fs.realpathSync(os.tmpdir()), uuidv4())
      console.log(filePath)
      process.env.GATSBY_TELEMETRY_METADATA_PATH = filePath

      fs.writeFileSync(filePath, JSON.stringify({ componentId: `test` }))
      await new Promise(resolve => {
        setTimeout(resolve, 2000)
      })
      // get it and make sure we see it and the ts matches
      res = t.getTagsFromPath()
      expect(res).toMatchObject({ componentId: `test` })
      let stat = fs.statSync(filePath)
      expect(t.lastEnvTagsFromFileTime).toBe(stat.mtimeMs)

      // Update the file
      fs.writeFileSync(filePath, JSON.stringify({ componentId: `test2` }))

      await new Promise(resolve => {
        setTimeout(resolve, 2000)
      })
      stat = fs.statSync(filePath)
      // make sure we see the change
      res = t.getTagsFromPath()
      expect(t.lastEnvTagsFromFileTime).toBe(stat.mtimeMs)
      expect(res).toMatchObject({ componentId: `test2` })

      // read it with out updating
      res = t.getTagsFromPath()
      expect(t.lastEnvTagsFromFileTime).toBe(stat.mtimeMs)
      expect(res).toMatchObject({ componentId: `test2` })
      fs.unlinkSync(filePath)

      const filePath2 = path.join(fs.realpathSync(os.tmpdir()), uuidv4())
      process.env.GATSBY_TELEMETRY_METADATA_PATH = filePath2
      res = t.getTagsFromPath()
      expect(t.lastEnvTagsFromFileTime).toBe(stat.mtimeMs)
      expect(res).toMatchObject({})
    }, 10000)
  })

  it(`getTagsFromPath is used for buildEvent`, async () => {
    const t = new AnalyticsTracker({
      componentId: `component`,
    })
    t.buildAndStoreEvent(`demo`, {})
    expect(
      (EventStorage as jest.Mock).mock.instances[1].addEvent
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: `demo`,
        componentId: `component`,
      })
    )
    const filePath = path.join(fs.realpathSync(os.tmpdir()), uuidv4())
    process.env.GATSBY_TELEMETRY_METADATA_PATH = filePath
    fs.writeFileSync(filePath, JSON.stringify({ componentId: `test` }))
    await new Promise(resolve => {
      setTimeout(resolve, 2000)
    })
    const stat = fs.statSync(filePath)
    t.buildAndStoreEvent(`demo2`, {})

    expect(t.lastEnvTagsFromFileTime).toBe(stat.mtimeMs)
    expect(
      (EventStorage as jest.Mock).mock.instances[1].addEvent
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: `demo2`,
        componentId: `test`,
      })
    )

    t.buildAndStoreEvent(`demo3`, {})
    expect(
      (EventStorage as jest.Mock).mock.instances[1].addEvent
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: `demo3`,
        componentId: `test`,
      })
    )

    expect(t.lastEnvTagsFromFileTime).toBe(stat.mtimeMs)

    fs.writeFileSync(filePath, JSON.stringify({ componentId: `4` }))
    await new Promise(resolve => {
      setTimeout(resolve, 2000)
    })
    const stat2 = fs.statSync(filePath)

    t.buildAndStoreEvent(`demo4`, {})
    expect(t.lastEnvTagsFromFileTime).toBe(stat2.mtimeMs)
    expect(
      (EventStorage as jest.Mock).mock.instances[1].addEvent
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: `demo4`,
        componentId: `4`,
      })
    )
    fs.unlinkSync(filePath)
  }, 10000)
})
