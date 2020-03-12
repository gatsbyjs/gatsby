import { getConfigStore, getGatsbyVersion } from "gatsby-core-utils"
import {
  setFeedbackDisabledValue,
  userPassesFeedbackRequestHeuristic,
} from "../feedback"
jest.mock(`date-fns/getDayOfYear`, (): (() => number) => (): number => {
  // This is required for Hueristic 1 to always match up
  // When Math.random returns 1 (mocked in the `clearStateToAllowHeuristicsToPass` fn)
  const currentQuarter = Math.floor((new Date().getMonth() + 3) / 3)
  return 1 * 30 * 3 * currentQuarter
})
jest.mock(`gatsby-core-utils`, () => {
  return {
    ...jest.requireActual(`gatsby-core-utils`),
    getGatsbyVersion: jest.fn(() => `2.1.1`),
  }
})

jest.mock(`latest-version`, (): (() => Promise<string>) => (): Promise<
  string
> => Promise.resolve(`2.1.1`))

const dateFromSixMonthsAgo = new Date()
dateFromSixMonthsAgo.setMonth(dateFromSixMonthsAgo.getMonth() - 6)
const mathRandom = Math.random

// This function resets all state to make the heuristic
// checks all pass. This is to be used to make sure an individual
// test truly only gets triggered by the state manipulations
// that exist within that test.
const clearStateToAllowHeuristicsToPass = (): void => {
  // Heuristic 1
  Math.random = jest.fn(() => 1)
  // Heuristic 2
  setFeedbackDisabledValue(false)
  // Heuristic 3
  delete process.env.GATSBY_FEEDBACK_DISABLED
  // Heuristic 4
  getConfigStore().set(`feedback.lastRequestDate`, dateFromSixMonthsAgo)
  // Heuristic 5
  ;(getGatsbyVersion as jest.Mock).mockReturnValue(`2.1.1`)
}

describe(`feedback`, () => {
  describe(`userPassesFeedbackRequestHeuristic returns false when`, () => {
    beforeEach(clearStateToAllowHeuristicsToPass)

    afterEach(() => {
      Math.random = mathRandom
    })

    it(`Heuristic 1: The random number generator hits today`, async () => {
      // ensure default is passing before manipulating a test
      expect(await userPassesFeedbackRequestHeuristic()).toBe(true)

      // Change the random value to return a different date
      ;(Math.random as jest.Mock).mockReturnValue(0.5)
      expect(await userPassesFeedbackRequestHeuristic()).toBe(false)

      // Unset to ensure tests are stable
      ;(Math.random as jest.Mock).mockReturnValue(1)
      expect(await userPassesFeedbackRequestHeuristic()).toBe(true)
    })

    it(`Heuristic 2: the gatsby disabled key is set to false`, async () => {
      // ensure default is passing before manipulating a test
      expect(await userPassesFeedbackRequestHeuristic()).toBe(true)

      setFeedbackDisabledValue(true)
      expect(await userPassesFeedbackRequestHeuristic()).toBe(false)

      // Unset to ensure tests are stable
      setFeedbackDisabledValue(false)
      expect(await userPassesFeedbackRequestHeuristic()).toBe(true)
    })

    it("Heuristic 3: the process.env.GATSBY_FEEDBACK_DISABLED argument is set to `1`", async () => {
      // ensure default is passing before manipulating a test
      expect(await userPassesFeedbackRequestHeuristic()).toBe(true)

      process.env.GATSBY_FEEDBACK_DISABLED = `1`
      expect(await userPassesFeedbackRequestHeuristic()).toBe(false)

      // Unset to ensure tests are stable
      process.env.GATSBY_FEEDBACK_DISABLED = `0`
      expect(await userPassesFeedbackRequestHeuristic()).toBe(true)
    })

    it(`Heuristic 4: It has been more than 3 months since the last feedback request`, async () => {
      // ensure default is passing before manipulating a test
      expect(await userPassesFeedbackRequestHeuristic()).toBe(true)

      // Set last prompt date to today
      getConfigStore().set(`feedback.lastRequestDate`, Date.now())
      expect(await userPassesFeedbackRequestHeuristic()).toBe(false)

      // Unset to ensure tests are stable
      getConfigStore().set(`feedback.lastRequestDate`, dateFromSixMonthsAgo)
      expect(await userPassesFeedbackRequestHeuristic()).toBe(true)
    })

    it(`Heuristic 5: The installed Gatsby is on the latest major + minor version`, async () => {
      // ensure default is passing before manipulating a test
      expect(await userPassesFeedbackRequestHeuristic()).toBe(true)

      // Mock the installed version to be a previous minor to force false
      ;(getGatsbyVersion as jest.Mock).mockReturnValue(`2.0.0`)
      expect(await userPassesFeedbackRequestHeuristic()).toBe(false)

      // Unset to ensure tests are stable
      ;(getGatsbyVersion as jest.Mock).mockReturnValue(`2.1.1`)
      expect(await userPassesFeedbackRequestHeuristic()).toBe(true)
    })
  })
})
