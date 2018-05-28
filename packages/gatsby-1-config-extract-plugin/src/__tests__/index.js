const { extractTextPlugin, extractTextFilename } = require(`../index`)

describe(`gatsby-1-config-extract-plugin`, () => {
  ;[
    {
      stages: [`develop`, `non-existent-stage`],
      expectPlugin: false,
    },
    {
      stages: [`develop-html`, `build-css`, `build-html`, `build-javascript`],
      expectPlugin: true,
    },
  ].forEach(({ stages, expectPlugin }) => {
    stages.forEach(stage => {
      describe(`stage: ${stage}`, () => {
        if (expectPlugin) {
          it(`should return plugin`, () => {
            expect(typeof extractTextPlugin(stage)).toBe(`object`)
          })
          it(`should return plugin with correct filename for current stage`, () => {
            expect(extractTextPlugin(stage)).toHaveProperty(
              `filename`,
              extractTextFilename(stage)
            )
          })
        } else {
          it(`should throw`, () => {
            expect(() => extractTextPlugin(stage)).toThrow()
          })
        }
      })
    })
  })
})
