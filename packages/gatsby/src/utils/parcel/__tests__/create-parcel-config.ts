import { IGatsbyConfig } from "../../../internal"
import { COMPILED_CACHE_DIR } from "../compile-gatsby-files"
import { createLocalPluginParcelConfig } from "../create-parcel-config"

let normalizeConfigMock: jest.Mock
let checkLocalPluginMock: jest.Mock

jest.mock(`../../../bootstrap/load-plugins/utils/normalize`)
jest.mock(`../../../bootstrap/load-plugins/utils/check-local-plugin`)

const resolve = `my-special-plugin`
const gatsbyConfig: IGatsbyConfig = {
  plugins: [
    {
      resolve,
      options: {
        some: `option`,
      },
    },
  ],
}
const siteRoot = __dirname
const localPluginPath = `${siteRoot}/plugins/${resolve}`
const dist = `${siteRoot}/${COMPILED_CACHE_DIR}/${resolve}`

describe(`createLocalPluginParcelConfig`, () => {
  beforeEach(() => {
    jest.clearAllMocks()
    normalizeConfigMock =
      require(`../../../bootstrap/load-plugins/utils/normalize`).normalizeConfig
    checkLocalPluginMock =
      require(`../../../bootstrap/load-plugins/utils/check-local-plugin`).checkLocalPlugin
  })

  it(`should create a parcel config from defined local plugins`, async () => {
    normalizeConfigMock.mockReturnValueOnce({
      plugins: [
        {
          resolve,
        },
      ],
    })
    checkLocalPluginMock.mockReturnValueOnce({
      validLocalPlugin: true,
      localPluginPath,
    })

    const localPluginParcelConfig = createLocalPluginParcelConfig(
      gatsbyConfig,
      siteRoot
    )

    expect(localPluginParcelConfig).toEqual([
      {
        entry: localPluginPath,
        dist,
      },
    ])
  })
})
