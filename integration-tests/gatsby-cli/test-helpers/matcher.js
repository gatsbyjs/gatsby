import strip from "strip-ansi"

export const createLogsMatcher = output => {
  const logs = output.map(strip)

  return {
    // Useful for debuggging
    logOutput() {
      console.log(logs.join("\n"))
    },

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
