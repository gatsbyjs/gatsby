import path from "path"
import { reporter } from "../utils/reporter"
import { initStarter } from "../init-starter"
import { setSiteMetadata } from "../utils/site-metadata"
import { run, DEFAULT_STARTERS } from "../index"

jest.mock(`../utils/parse-args`)
jest.mock(`enquirer`, () => {
  const OriginalEnquirer = jest.requireActual(`enquirer`)

  class MockedEnquirer extends OriginalEnquirer {
    constructor() {
      super()
      // Turns waiting for user input off and autofills with answers
      this.options = { show: false, autofill: true }

      // Mock answers
      this.answers = {
        // First prompt answer
        name: `my-site`,

        // Main question set answers
        project: `hello-world`,
        language: `js`,
        cms: `none`,
        styling: `none`,
        features: [],

        // Confirmation prompt answer
        confirm: true,
      }
    }
  }
  return MockedEnquirer
})
jest.mock(`../utils/reporter`)
jest.mock(`../init-starter`, () => {
  return {
    initStarter: jest.fn(),
    getPackageManager: jest.fn(),
    gitSetup: jest.fn(),
  }
})
jest.mock(`../install-plugins`, () => {
  return {
    installPlugins: jest.fn(),
  }
})
jest.mock(`../utils/site-metadata`, () => {
  return {
    setSiteMetadata: jest.fn(),
  }
})

jest.mock(`../utils/question-helpers`, () => {
  const originalQuestionHelpers = jest.requireActual(
    `../utils/question-helpers`
  )
  return {
    ...originalQuestionHelpers,
    validateProjectName: jest.fn(() => true),
  }
})
jest.mock(`../components/utils`, () => {
  return {
    center: jest.fn(args => args),
    wrap: jest.fn(args => args),
  }
})

const dirName = `hello-world`
const siteName = `my-site`
const fullPath = path.resolve(`hello-world`)

let parseArgsMock

describe(`run`, () => {
  beforeEach(() => {
    jest.clearAllMocks()
    parseArgsMock = require(`../utils/parse-args`).parseArgs
  })

  describe(`gatsby-config.js `, () => {
    beforeEach(() => {
      parseArgsMock.mockReturnValueOnce({
        flags: { yes: false },
        siteName,
      })
    })

    it(`should use siteName as site title`, async () => {
      await run()
      expect(setSiteMetadata).toHaveBeenCalledWith(fullPath, `title`, siteName)
    })
  })

  describe(`no skip flag`, () => {
    beforeEach(() => {
      parseArgsMock.mockReturnValueOnce({
        flags: { yes: false },
        dirName,
      })
    })

    it(`should welcome the user`, async () => {
      await run()
      expect(reporter.info).toHaveBeenCalledWith(
        expect.stringContaining(`Welcome to Gatsby!`)
      )
    })
    it(`should communicate setup questions will be asked`, async () => {
      await run()
      expect(reporter.info).toHaveBeenCalledWith(
        expect.stringContaining(
          `This command will generate a new Gatsby site for you`
        )
      )
    })
    it(`should confirm actions`, async () => {
      await run()
      expect(reporter.info).toHaveBeenCalledWith(
        expect.stringContaining(`Thanks! Here's what we'll now do`)
      )
    })
    it(`should notify of successful site creation`, async () => {
      await run()
      expect(reporter.success).toHaveBeenCalledWith(
        expect.stringContaining(`Created site`)
      )
    })
  })

  describe(`skip flag`, () => {
    beforeEach(() => {
      parseArgsMock.mockReturnValueOnce({
        flags: { yes: true },
        dirName,
      })
    })

    it(`should welcome the user`, async () => {
      await run()
      expect(reporter.info).toHaveBeenCalledWith(
        expect.stringContaining(`Welcome to Gatsby!`)
      )
    })
    it(`should not communicate setup questions`, async () => {
      await run()
      expect(reporter.info).not.toHaveBeenCalledWith(
        expect.stringContaining(
          `This command will generate a new Gatsby site for you`
        )
      )
    })
    it(`should not confirm actions`, async () => {
      await run()
      expect(reporter.info).not.toHaveBeenCalledWith(
        expect.stringContaining(`Thanks! Here's what we'll now do`)
      )
    })
    it(`should notify of successful site creation`, async () => {
      await run()
      expect(reporter.success).toHaveBeenCalledWith(
        expect.stringContaining(`Created site`)
      )
    })
    it(`should use the JS starter by default`, async () => {
      await run()
      expect(initStarter).toHaveBeenCalledWith(
        DEFAULT_STARTERS.js,
        dirName,
        [],
        dirName
      )
    })
  })

  describe(`no ts flag`, () => {
    beforeEach(() => {
      parseArgsMock.mockReturnValueOnce({
        flags: { ts: false },
        dirName,
      })
    })

    it(`should use the JS starter`, async () => {
      await run()
      expect(initStarter).toHaveBeenCalledWith(
        DEFAULT_STARTERS.js,
        dirName,
        [],
        siteName
      )
    })
  })

  describe(`ts flag`, () => {
    beforeEach(() => {
      parseArgsMock.mockReturnValueOnce({
        flags: { ts: true },
        dirName,
      })
    })

    it(`should use the TS starter`, async () => {
      await run()
      expect(initStarter).toHaveBeenCalledWith(
        DEFAULT_STARTERS.ts,
        dirName,
        [],
        siteName
      )
    })
  })
})

describe(`skip and ts flag`, () => {
  beforeEach(() => {
    parseArgsMock.mockReturnValueOnce({
      flags: { yes: true, ts: true },
      dirName,
    })
  })

  it(`should use the TS starter`, async () => {
    await run()
    expect(initStarter).toHaveBeenCalledWith(
      DEFAULT_STARTERS.ts,
      dirName,
      [],
      dirName
    )
  })
})
