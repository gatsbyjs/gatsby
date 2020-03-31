const emptySpaceToCauseFailure = "     "

export const createLogsMatcher = logs => {
  return {
    should: {
      contain: match => {
        const foundMatch = logs.reduce(
          (matches, log) => matches || new RegExp(match).test(log),
          false
        )

        if (!foundMatch) {
          // This will never pass, but lets user see the issues
          expect(logs).toBe(match)
          return
        }

        // track an assertion that passes!
        expect(match).toBe(match)
      },
    },
  }
}
