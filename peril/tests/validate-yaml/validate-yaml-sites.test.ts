jest.mock("danger", () => jest.fn())
import * as danger from "danger"
import { validateYaml, utils } from "../../rules/validate-yaml"
const dm = danger as any
const mockedUtils = utils as any

let mockedResponses: { [id: string]: any }
const setSitesYmlContent = (content: string) => {
  mockedResponses["docs/sites.yml"] = content
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
      modified_files: ["docs/sites.yml"],
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
  it(`Minimal valid entry passes validation`, async () => {
    setSitesYmlContent(`
      - title: lorem
        url: http://google.com/
        main_url: http://google.com/
        categories:
          - Web Development
    `)
    expect(mockedUtils.addErrorMsg).not.toBeCalled()
    expect(dm.warn).not.toBeCalled()
  })

  it(`Full valid entry passes validation`, async () => {
    setSitesYmlContent(`
      - title: lorem
        url: http://google.com/
        main_url: http://google.com/
        source_url: http://google.com/
        description: lorem
        categories:
          - Web Development
          - WordPress
        built_by: lorem
        built_by_url: http://google.com/
        featured: false
    `)

    await validateYaml()

    expect(mockedUtils.addErrorMsg).not.toBeCalled()
    expect(dm.warn).not.toBeCalled()
  })

  it(`Check for required fields and disallow unknown fields`, async () => {
    setSitesYmlContent(`
      - test: loem
    `)

    await validateYaml()
    expect(dm.warn).toBeCalled()
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"title" is required'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"url" is required'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"main_url" is required'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"categories" is required'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"test" is not allowed'),
      expect.anything()
    )
  })

  it(`Check type of fields`, async () => {
    setSitesYmlContent(`
    - title: 1
      url: 2
      main_url: 3
      source_url: 4
      description: 5
      categories: 6
      built_by: 7
      built_by_url: 8
      featured: 9
    - title: lorem
      url: www.google.com
      main_url: www.google.com
      source_url: www.google.com
      categories:
        - 1
        - true
      built_by_url: www.google.com
    - title: lorem
      url: http://google.com/
      main_url: http://google.com/
      categories:
        - Fancy new category
        - Oh I'm so smart and original
    `)

    await validateYaml()
    expect(dm.warn).toBeCalled()
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"title" must be a string'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"url" must be a string'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"main_url" must be a string'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"source_url" must be a string'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"description" must be a string'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"categories" must be an array'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"built_by" must be a string'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"built_by_url" must be a string'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"featured" must be a boolean'),
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
        '"main_url" must be a valid uri with a scheme matching the https|http pattern'
      ),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      1,
      expect.stringContaining(
        '"source_url" must be a valid uri with a scheme matching the https|http pattern'
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
      1,
      expect.stringContaining(
        '"built_by_url" must be a valid uri with a scheme matching the https|http pattern'
      ),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      2,
      expect.stringContaining(
        `"0" must be one of [Web Development, WordPress]`
      ),
      expect.anything()
    )
  })

  it(`Check for duplicates`, async () => {
    setSitesYmlContent(`
    - title: lorem
      url: http://google.com/
      main_url: http://google.com/
      categories:
        - Web Development
    - title: lorem
      url: http://google2.com/
      main_url: http://google2.com/
      categories:
        - Web Development
    - title: ipsum
      url: http://google.com/
      main_url: http://google3.com/
      categories:
        - Web Development
    - title: dolor
      url: http://google3.com/
      main_url: http://google.com/
      categories:
        - Web Development
    `)

    await validateYaml()
    expect(dm.warn).toBeCalled()
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      1,
      expect.stringContaining('"title" is not unique'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      2,
      expect.stringContaining('"url" is not unique'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      3,
      expect.stringContaining('"main_url" is not unique'),
      expect.anything()
    )
  })
})
