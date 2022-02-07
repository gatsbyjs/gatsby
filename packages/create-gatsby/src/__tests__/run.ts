import { reporter } from "../utils/reporter"
import { initStarter } from "../init-starter"
import { trackCli } from "../tracking"
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
        name: `hello-world`,

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
jest.mock(`../tracking`, () => {
  return {
    trackCli: jest.fn(),
  }
})
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
jest.mock(`../utils/hash`, () => {
  return {
    sha256: jest.fn(args => args),
    md5: jest.fn(args => args),
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
let parseArgsMock

describe(`run`, () => {
  beforeEach(() => {
    jest.clearAllMocks()
    parseArgsMock = require(`../utils/parse-args`).parseArgs
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
        `hello-world`,
        [],
        `hello-world`
      )
    })

    it(`should track JS was selected as language`, async () => {
      await run()
      expect(trackCli).toHaveBeenCalledWith(`CREATE_GATSBY_SELECT_OPTION`, {
        name: `LANGUAGE`,
        valueString: `js`,
      })
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
        `hello-world`,
        [],
        `hello-world`
      )
    })

    it(`should track TS was selected as language`, async () => {
      await run()
      expect(trackCli).toHaveBeenCalledWith(`CREATE_GATSBY_SELECT_OPTION`, {
        name: `LANGUAGE`,
        valueString: `ts`,
      })
    })
  })
})
