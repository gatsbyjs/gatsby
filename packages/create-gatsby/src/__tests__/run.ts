import { reporter } from "../utils/reporter"
import { run } from "../index"

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
jest.mock(`../utils/question-helpers`, () => {
  const originalQuestionHelpers = jest.requireActual(
    `../utils/question-helpers`
  )
  return {
    ...originalQuestionHelpers,
    validateProjectName: jest.fn(() => true),
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
    it(`should communicate setup questions will be asked if no skip flag is passed`, async () => {
      await run()
      expect(reporter.info).toHaveBeenCalledWith(
        expect.stringContaining(
          `This command will generate a new Gatsby site for you`
        )
      )
    })
    it(`should confirm actions if no skip flag is passed`, async () => {
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
    it(`should not communicate setup questions if skip flag is passed`, async () => {
      await run()
      expect(reporter.info).not.toHaveBeenCalledWith(
        expect.stringContaining(
          `This command will generate a new Gatsby site for you`
        )
      )
    })
    it(`should not confirm actions if skip flag is passed`, async () => {
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
})
