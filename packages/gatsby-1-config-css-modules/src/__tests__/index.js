const { cssModulesConfig, LOCAL_IDENT_NAME } = require("../index")

describe(`gatsby-1-config-css-modules`, () => {
  ;[
    {
      stages: [`develop`, `develop-html`],
      expectSourceMapOrNot: expect => expect,
    },
    {
      stages: [`build-css`, `build-html`, `build-javascript`],
      expectSourceMapOrNot: expect => expect.not,
    },
  ].forEach(({ stages, expectSourceMapOrNot }) => {
    stages.forEach(stage => {
      describe(`stage: ${stage}`, () => {
        const loader = cssModulesConfig(stage)

        it(`should return a CSS Modules loader`, () => {
          expect(loader).toMatch(/^css\?modules&/)
        })

        it(`should include the localIdentName`, () => {
          expect(loader).toMatch(`&localIdentName=${LOCAL_IDENT_NAME}`)
        })

        const maybeNot = Object.assign(``, { not: `not` })
        it(`should ${expectSourceMapOrNot(maybeNot)}include sourceMap`, () => {
          expectSourceMapOrNot(expect(loader)).toMatch(`&sourceMap`)
        })
      })
    })
  })
})
