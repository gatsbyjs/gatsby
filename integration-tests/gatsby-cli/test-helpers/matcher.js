export const createLogsMatcher = output => {
  return {
    // Useful for debugging
    logOutput() {
      console.log(output)
    },

    should: {
      contain: match => {
        // ink will auto wrap things, so we need to get rid of any whitespace specific checks
        // and let it just make sure there is whitespace

        expect(output).toMatch(
          new RegExp(
            match
              .replace(/\s+/g, `\\s+`)
              .replace(/\(/g, `\\(`)
              .replace(/\)/g, `\\)`)
          )
        )
      },
    },
  }
}
