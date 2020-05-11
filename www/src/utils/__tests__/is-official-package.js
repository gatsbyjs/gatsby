import isOfficialPackage from "../is-official-package"

describe(`isOfficialPackage`, () => {
  it(`returns true when repository is gatsby`, () => {
    expect(
      isOfficialPackage({
        name: "gatsby",
        repository: {
          url: `https://github.com/gatsbyjs/gatsby`,
        },
      })
    ).toBeTruthy()
  })

  it(`returns false when the package is name scoped`, () => {
    expect(
      isOfficialPackage({
        name: "@kyleamathews/gatsby",
        repository: {
          url: `https://github.com/gatsbyjs/gatsby`,
        },
      })
    ).toBeFalsy()
  })

  it(`returns false when the package has no repository`, () => {
    expect(
      isOfficialPackage({
        name: "gatsby-theme-fake",
      })
    ).toBeFalsy()
  })

  it(`returns false when the repo is not gatsby`, () => {
    expect(
      isOfficialPackage({
        name: "gatsby-theme-my-blog",
        repository: {
          url: `https://github.com/kyelamathews/gatsby-theme-my-blog`,
        },
      })
    ).toBeFalsy()
  })
})
