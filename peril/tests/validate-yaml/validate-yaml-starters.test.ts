jest.mock("danger", () => jest.fn())
import * as danger from "danger"
import { validateYaml, utils } from "../../rules/validate-yaml"
const dm = danger as any
const mockedUtils = utils as any

let mockedResponses: { [id: string]: any }
const setStartersYmlContent = (content: string) => {
  mockedResponses["docs/starters.yml"] = content
}
const setCategoriesContent = (content: string) => {
  mockedResponses["docs/categories.yml"] = content
}
const resetMockedResponses = () => {
  mockedResponses = {}
}

dm.warn = jest.fn()
mockedUtils.addErrorMsg = jest.fn()

beforeEach(() => {
  resetMockedResponses()
  setCategoriesContent(`
starter:
  - CMS:Headless,
  - Styling:CSS-in-JS
  - Official
site:
  - Web Development
  - WordPress
`)
  dm.warn.mockClear()
  mockedUtils.addErrorMsg.mockClear()
  dm.danger = {
    git: {
      modified_files: ["docs/starters.yml"],
    },
    github: {
      pr: {
        head: {
          repo: {
            full_name: "test/test",
          },
          ref: "branch",
        },
      },
      utils: {
        fileContents: (path: string) => mockedResponses[path],
      },
    },
  }
})

describe("a new PR", () => {
  it(`Valid entry passes validation`, async () => {
    setStartersYmlContent(`
    - url: http://gatsbyjs.github.io/gatsby-starter-default/
      repo: https://github.com/gatsbyjs/gatsby-starter-default
      description: official default
      features:
        - It works
      tags:
        - Official
    `)

    await validateYaml()
    expect(dm.warn).not.toBeCalled()
    expect(mockedUtils.addErrorMsg).not.toBeCalled()
  })

  it(`Check for required fields and disallow unknown fields`, async () => {
    setStartersYmlContent(`
      - test: loem
    `)

    await validateYaml()
    expect(dm.warn).toBeCalled()
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledTimes(6)
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"url" is required'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"repo" is required'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"description" is required'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"tags" is required'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"features" is required'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"test" is not allowed'),
      expect.anything()
    )
  })

  it(`Check type of fields`, async () => {
    setStartersYmlContent(`
    - url: 1
      repo: 2
      description: 3
      tags: 4
      features: 5
    - url: www.google.com
      repo: www.google.com
      description: lorem
      tags:
        - 1
        - true
      features:
        - 2
        - false
    - url: www.google.com
      repo: https://gitlab.com/gatsbyjs/gatsby-starter-default
      description: lorem
      features:
        - It works
      tags:
        - I'm a fancy new tag
        - I don't play by the rules
    `)

    await validateYaml()
    expect(dm.warn).toBeCalled()
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"url" must be a string'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"repo" must be a string'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"description" must be a string'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"tags" must be an array'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"features" must be an array'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      1,
      expect.stringContaining(
        '"url" must be a valid uri with a scheme matching the https|http pattern'
      ),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      1,
      expect.stringContaining(
        '"repo" must be a valid uri with a scheme matching the https|http pattern'
      ),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      1,
      expect.stringContaining('"0" must be a string'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      1,
      expect.stringContaining('"1" must be a string'),
      expect.anything()
    )

    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      2,
      expect.stringContaining(
        `"0" must be one of [CMS:Headless,, Styling:CSS-in-JS, Official]`
      ),
      expect.anything()
    )
  })

  it(`Doesn't allow non GitHub repos`, async () => {
    setStartersYmlContent(`
    - url: http://gatsbyjs.github.io/gatsby-starter-default/
      repo: https://gitlab.com/gatsbyjs/gatsby-starter-default
      description: official default
      features:
        - It works
      tags:
        - Official
    `)

    await validateYaml()
    expect(dm.warn).toBeCalled()
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledTimes(1)
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining(
        '"repo" with value "https://gitlab.com/gatsbyjs/gatsby-starter-default" fails to match the required pattern: /^https?:\\/\\/github.com\\/[^\\/]+\\/[^\\/]+$/'
      ),
      expect.anything()
    )
  })

  it(`Check for duplicates`, async () => {
    setStartersYmlContent(`
    - url: http://gatsbyjs.github.io/gatsby-starter-default/
      repo: https://github.com/gatsbyjs/gatsby-starter-default
      description: official default
      features:
        - It works
      tags:
        - Official
    - url: http://gatsbyjs.github.io/gatsby-starter-default2/
      repo: https://github.com/gatsbyjs/gatsby-starter-default
      description: official default
      features:
        - It works
      tags:
        - Official
    - url: http://gatsbyjs.github.io/gatsby-starter-default/
      repo: https://github.com/gatsbyjs/gatsby-starter-default2
      description: official default
      features:
        - It works
      tags:
        - Official
    `)

    await validateYaml()
    expect(dm.warn).toBeCalled()
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledTimes(2)
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      1,
      expect.stringContaining('"repo" is not unique'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      2,
      expect.stringContaining('"url" is not unique'),
      expect.anything()
    )
  })
})
