import { getConfigStore, getGatsbyVersion } from "gatsby-core-utils"
import {
  setFeedbackDisabledValue,
  userPassesFeedbackRequestHeuristic,
} from "../feedback"
jest.mock("gatsby-core-utils", () => ({
  ...jest.requireActual("gatsby-core-utils"),
  getGatsbyVersion: jest.fn(() => "2.1.1"),
}))

jest.mock("latest-version", () => () => Promise.resolve("2.1.1"))

// This function resets all state to make the heuristic
// checks all pass. This is to be used to make sure an individual
// test truly only gets triggered by the state manipulations
// that exist within that test.
const clearStateToAllowHeuristicsToPass = () => {
  // Heuristic 1
  setFeedbackDisabledValue(false)
  // Heuristic 2
  delete process.env.GATSBY_FEEDBACK_DISABLED
  // Heuristic 3
  getConfigStore().set(`feedback.lastRequestDate`, Date.now()) // Heuristic 4
  ;(getGatsbyVersion as jest.Mock).mockReturnValue("2.1.1")
}

describe("feedback", () => {
  describe("userPassesFeedbackRequestHeuristic returns false when", () => {
    beforeEach(clearStateToAllowHeuristicsToPass)

    it("Heuristic 1: the gatsby disabled key is set to false", async () => {
      // ensure default is passing before manipulating a test
      expect(await userPassesFeedbackRequestHeuristic()).toBe(true)

      setFeedbackDisabledValue(true)
      expect(await userPassesFeedbackRequestHeuristic()).toBe(false)

      // Unset to ensure tests are stable
      setFeedbackDisabledValue(false)
      expect(await userPassesFeedbackRequestHeuristic()).toBe(true)
    })

    it("Heuristic 2: the process.env.GATSBY_FEEDBACK_DISABLED argument is set to `1`", async () => {
      // ensure default is passing before manipulating a test
      expect(await userPassesFeedbackRequestHeuristic()).toBe(true)

      process.env.GATSBY_FEEDBACK_DISABLED = `1`
      expect(await userPassesFeedbackRequestHeuristic()).toBe(false)

      // Unset to ensure tests are stable
      process.env.GATSBY_FEEDBACK_DISABLED = `0`
      expect(await userPassesFeedbackRequestHeuristic()).toBe(true)
    })

    it("Heuristic 3: It has been more than 3 months since the last feedback request", async () => {
      // ensure default is passing before manipulating a test
      expect(await userPassesFeedbackRequestHeuristic()).toBe(true)

      // Set last prompt date to 6 months ago
      const dateFromSixMonthsAgo = new Date()
      dateFromSixMonthsAgo.setMonth(dateFromSixMonthsAgo.getMonth() - 6)
      getConfigStore().set("feedback.lastRequestDate", dateFromSixMonthsAgo)
      expect(await userPassesFeedbackRequestHeuristic()).toBe(false)

      // Unset to ensure tests are stable
      getConfigStore().set("feedback.lastRequestDate", Date.now)
      expect(await userPassesFeedbackRequestHeuristic()).toBe(true)
    })

    it("Heuristic 4: The installed Gatsby is on the latest major + minor version", async () => {
      // ensure default is passing before manipulating a test
      expect(await userPassesFeedbackRequestHeuristic()).toBe(true)

      // Mock the installed version to be a previous minor to force false
      ;(getGatsbyVersion as jest.Mock).mockReturnValue("2.0.0")
      expect(await userPassesFeedbackRequestHeuristic()).toBe(false)

      // Unset to ensure tests are stable
      ;(getGatsbyVersion as jest.Mock).mockReturnValue("2.1.1")
      expect(await userPassesFeedbackRequestHeuristic()).toBe(true)
    })
  })
})
