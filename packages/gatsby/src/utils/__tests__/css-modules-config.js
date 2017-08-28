import cssModulesConfig from "../css-modules-config"

describe(`css-modules-config`, () => {
  ;[`develop`, `develop-html`].forEach(stage => {
    it(`should include sourceMap and localIdentName for ${stage}`, () => {
      const loader = cssModulesConfig(stage)
      expect(loader).toMatch(/^css\?modules.*&sourceMap.*&localIdentName=.+$/)
    })
  })
  ;[`build-css`, `build-html`, `build-javascript`].forEach(stage => {
    it(`should include neither sourceMap nor localIdentName for ${stage}`, () => {
      delete process.env.CSS_MODULE_FORMAT
      const loader = cssModulesConfig(stage)

      expect(loader).toMatch(/^css\?modules/)
      expect(loader).not.toMatch(`&sourceMap`)
      expect(loader).not.toMatch(`&localIdentName=`)
    })
  })
})
