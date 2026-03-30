jest.mock("danger", () => jest.fn())
import * as danger from "danger"
import { validateYaml, utils } from "../../rules/validate-yaml"
const dm = danger as any
const mockedUtils = utils as any

let mockedResponses: { [id: string]: any }
const setAuthorYmlContent = (content: string) =>
  (mockedResponses["docs/blog/author.yaml"] = content)
const setAvatarFiles = (filenames: string[]) =>
  (mockedResponses["docs/blog/avatars"] = {
    data: filenames.map(filename => ({ name: filename })),
  })
const resetMockedResponses = () => {
  mockedResponses = {}
  setAvatarFiles([])
}

dm.warn = jest.fn()
mockedUtils.addErrorMsg = jest.fn()

beforeEach(() => {
  resetMockedResponses()
  dm.warn.mockClear()
  mockedUtils.addErrorMsg.mockClear()
  dm.danger = {
    git: {
      modified_files: ["docs/blog/author.yaml"],
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
  it(`Valid entry passes validation`, async () => {
    setAuthorYmlContent(`
      - id: lorem
        bio: ipsum
        twitter: '@lorem'
        avatar: avatars/lorem.jpg
    `)
    setAvatarFiles(["lorem.jpg"])

    await validateYaml()
    expect(dm.warn).not.toBeCalled()
    expect(mockedUtils.addErrorMsg).not.toBeCalled()
  })

  it(`Check for required fields`, async () => {
    setAuthorYmlContent(`
      - twitter: '@lorem'
    `)

    await validateYaml()
    expect(dm.warn).toBeCalled()
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledTimes(3)
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"id" is required'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"bio" is required'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"avatar" is required'),
      expect.anything()
    )
  })

  it(`Check type of fields`, async () => {
    setAuthorYmlContent(`
    - id: 1
      bio: 2
      twitter: 3
      avatar: 4
    `)

    await validateYaml()
    expect(dm.warn).toBeCalled()
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledTimes(4)
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"id" must be a string'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"bio" must be a string'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"twitter" must be a string'),
      expect.anything()
    )
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"avatar" must be a string'),
      expect.anything()
    )
  })

  it(`Doesn't allow not supported extensions`, async () => {
    setAuthorYmlContent(`
      - id: lorem
        bio: ipsum
        twitter: '@lorem'
        avatar: avatars/lorem.svg
    `)
    setAvatarFiles(["lorem.svg"])

    await validateYaml()
    expect(dm.warn).toBeCalled()
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledTimes(1)
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"avatar" need to use supported extension'),
      expect.anything()
    )
  })

  it(`Doesn't allow not existing images`, async () => {
    setAuthorYmlContent(`
      - id: lorem
        bio: ipsum
        twitter: '@lorem'
        avatar: avatars/lorem.jpg
    `)
    setAvatarFiles(["ipsum.jpg"])

    await validateYaml()
    expect(dm.warn).toBeCalled()
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledTimes(1)
    expect(mockedUtils.addErrorMsg).toHaveBeenCalledWith(
      0,
      expect.stringContaining('"avatar" need to point to existing file'),
      expect.anything()
    )
  })
})
