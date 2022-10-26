jest.mock("danger", () => jest.fn())
import * as danger from "danger"
import { validateYaml, utils } from "../../rules/validate-yaml"
const dm = danger as any
const mockedUtils = utils as any

let mockedResponses: { [id: string]: any }
const setCreatorsYmlContent = (content: string) =>
  (mockedResponses["docs/community/creators.yml"] = content)
const setImagesFiles = (filesnames: string[]) =>
  (mockedResponses["docs/community/images"] = {
    data: filesnames.map(filename => ({ name: filename })),
  })
const resetMockedResponses = () => {
  mockedResponses = {}
  setImagesFiles([])
}

dm.warn = jest.fn()
mockedUtils.addErrorMsg = jest.fn()

beforeEach(() => {
  resetMockedResponses()
  dm.warn.mockClear()
  mockedUtils.addErrorMsg.mockClear()
  dm.danger = {
    git: {
      modified_files: ["docs/community/creators.yml"],
    },
    github: {
      api: {
        repos: {
          getContent: ({ path }: { path: string }) => mockedResponses[path],
        },
      },
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
    setCreatorsYmlContent(`
      - name: lorem
        type: individual
        image: images/lorem.jpg
    `)
    setImagesFiles(["lorem.jpg"])

    await validateYaml()
    expect(dm.warn).not.toBeCalled()
    expect(mockedUtils.addErrorMsg).not.toBeCalled()
  })

  it(`Full valid entry passes validation`, async () => {
    setCreatorsYmlContent(`
      - name: lorem
        type: individual
        image: images/lorem.jpg
        description: lorem ipsum
        location: moon
        github: https://github.com/gatsbyjs
        website: https://www.gatsbyjs.com/
        for_hire: false
        portfolio: true
        hiring: false

    `)
    setImagesFiles(["lorem.jpg"])

    await validateYaml()
    expect(dm.warn).not.toBeCalled()
    expect(mockedUtils.addErrorMsg).not.toBeCalled()
  })

  it(`Check for required fields`, async () => {
    setCreatorsYmlContent(`
      - location: moon
    `)

    await validateYaml()
    expect(dm.warn).toBeCalled()
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledTimes(3)
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"name" is required'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"type" is required'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"image" is required'),
      expect.anything()
    )
  })

  it(`Check type of fields`, async () => {
    setCreatorsYmlContent(`
    - name: 1
      type: 2
      description: 3
      location: 4
      github: 5
      website: 6
      for_hire: foo
      portfolio: bar
      hiring: baz
      image: 7
    `)

    await validateYaml()
    expect(dm.warn).toBeCalled()
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledTimes(10)
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"name" must be a string'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"type" must be a string'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"description" must be a string'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"location" must be a string'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"github" must be a string'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"website" must be a string'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"for_hire" must be a boolean'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"portfolio" must be a boolean'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"hiring" must be a boolean'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"image" must be a string'),
      expect.anything()
    )
  })

  it(`Doesn't allow not supported types`, async () => {
    setCreatorsYmlContent(`
      - name: lorem
        type: doesn't exist
        image: images/lorem.jpg
    `)
    setImagesFiles(["lorem.jpg"])

    await validateYaml()
    expect(dm.warn).toBeCalled()
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledTimes(1)
    expect(mockedUtils.addErrorMsg).toBeCalledWith(
      0,
      expect.stringContaining(
        '"type" must be one of [individual, agency, company]'
      ),
      expect.anything()
    )
  })

  it(`Doesn't allow bad links`, async () => {
    setCreatorsYmlContent(`
      - name: lorem
        type: company
        image: images/lorem.jpg
        github: foo
        website: www.google.com
    `)
    setImagesFiles(["lorem.jpg"])

    await validateYaml()
    expect(dm.warn).toBeCalled()
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledTimes(2)
    expect(mockedUtils.addErrorMsg).toBeCalledWith(
      0,
      expect.stringContaining(
        '"github" must be a valid uri with a scheme matching the https|http pattern'
      ),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toBeCalledWith(
      0,
      expect.stringContaining(
        '"website" must be a valid uri with a scheme matching the https|http pattern'
      ),
      expect.anything()
    )
  })

  it(`Doesn't allow not supported extensions`, async () => {
    setCreatorsYmlContent(`
      - name: lorem
        type: company
        image: images/lorem.svg
    `)
    setImagesFiles(["lorem.svg"])

    await validateYaml()
    expect(dm.warn).toBeCalled()
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledTimes(1)
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"image" need to use supported extension'),
      expect.anything()
    )
  })

  it(`Doesn't allow not existing images`, async () => {
    setCreatorsYmlContent(`
      - name: lorem
        type: company
        image: images/lorem.jpg
    `)
    setImagesFiles(["ipsum.jpg"])

    await validateYaml()
    expect(dm.warn).toBeCalled()
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledTimes(1)
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"image" need to point to existing file'),
      expect.anything()
    )
  })
})
