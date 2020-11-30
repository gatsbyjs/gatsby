import handleFlags from "../handle-flags"
import _ from "lodash"
import { IFlag } from "./flags"

jest.mock(`gatsby-core-utils`, () => {
  return {
    isCI: (): boolean => true,
  }
})

describe(`handle flags`, () => {
  const activeFlags: Array<IFlag> = [
    {
      name: `FAST_DEV`,
      env: `GATSBY_EXPERIMENTAL_FAST_DEV`,
      command: `develop`,
      description: `Enable all experiments aimed at improving develop server start time`,
      includedFlags: [`DEV_SSR`, `QUERY_ON_DEMAND`],
    },
    {
      name: `DEV_SSR`,
      env: `GATSBY_EXPERIMENTAL_DEV_SSR`,
      command: `develop`,
      description: `SSR pages on full reloads during develop. Helps you detect SSR bugs and fix them without needing to do full builds.`,
      umbrellaIssue: `https://github.com/gatsbyjs/gatsby/discussions/28138`,
    },
    {
      name: `QUERY_ON_DEMAND`,
      env: `GATSBY_EXPERIMENTAL_QUERY_ON_DEMAND`,
      command: `develop`,
      description: `Only run queries when needed instead of running all queries upfront. Speeds starting the develop server.`,
      umbrellaIssue: `https://github.com/gatsbyjs/gatsby/discussions/27620`,
      noCI: true,
    },
    {
      name: `ONLY_BUILDS`,
      env: `GATSBY_EXPERIMENTAL_BUILD_ME_FASTER`,
      command: `build`,
      description: `test`,
      umbrellaIssue: `test`,
    },
    {
      name: `ALL_COMMANDS`,
      env: `GATSBY_EXPERIMENTAL_SOMETHING_COOL`,
      command: `all`,
      description: `test`,
      umbrellaIssue: `test`,
    },
    {
      name: `YET_ANOTHER`,
      env: `GATSBY_EXPERIMENTAL_SOMETHING_COOL2`,
      command: `all`,
      description: `test`,
      umbrellaIssue: `test`,
    },
    {
      name: `PARTIAL_RELEASE`,
      env: `GATSBY_READY_TO_GO`,
      command: `all`,
      description: `test`,
      umbrellaIssue: `test`,
      partialRelease: {
        percentage: 100,
        releaseNotes: `https://example.com`,
      },
    },
    {
      name: `PARTIAL_RELEASE_ONLY_VERY_OLD_LODASH`,
      env: `GATSBY_READY_TO_GO_LODASH`,
      command: `all`,
      description: `test`,
      umbrellaIssue: `test`,
      semver: {
        // Because of this, this flag will never show up
        lodash: `<=3.9`,
      },
      partialRelease: {
        percentage: 100,
        releaseNotes: `https://example.com`,
      },
    },
    {
      name: `PARTIAL_RELEASE_ONLY_NEW_LODASH`,
      env: `GATSBY_READY_TO_GO_NEW_LODASH`,
      command: `all`,
      description: `test`,
      umbrellaIssue: `test`,
      semver: {
        lodash: `>=4.9`,
      },
      partialRelease: {
        percentage: 100,
        releaseNotes: `https://example.com`,
      },
    },
  ]

  const configFlags = {
    FAST_DEV: true,
    ALL_COMMANDS: true,
  }
  const configFlagsWithFalse = {
    ALL_COMMANDS: true,
    DEV_SSR: false,
  }
  const configWithFlagsNoCi = {
    QUERY_ON_DEMAND: true,
    DEV_SSR: true,
  }

  it(`returns enabledConfigFlags and a message`, () => {
    expect(handleFlags(activeFlags, configFlags, `develop`)).toMatchSnapshot()
  })

  it(`filters out flags marked false`, () => {
    expect(
      handleFlags(activeFlags, configFlagsWithFalse, `develop`)
        .enabledConfigFlags
    ).toHaveLength(3)
  })

  it(`filters out flags that are marked as not available on CI`, () => {
    expect(
      handleFlags(activeFlags, configWithFlagsNoCi, `develop`)
        .enabledConfigFlags
    ).toHaveLength(3)
  })

  it(`filters out flags that aren't for the current command`, () => {
    expect(
      handleFlags(activeFlags, configFlags, `build`).enabledConfigFlags
    ).toHaveLength(3)
  })

  it(`returns a message about unknown flags in the config`, () => {
    const unknownConfigFlags = handleFlags(
      activeFlags,
      { ALL_COMMANDS: true, FASTLY_DEV: true, SUPER_COOL_FLAG: true },
      `develop`
    )
    expect(unknownConfigFlags).toMatchSnapshot()
  })

  it(`opts in sites to a flag if their site is selected for partial release`, () => {
    // Nothing is enabled in their config.
    const response = handleFlags(activeFlags, {}, `develop`)
    expect(response).toMatchSnapshot()
  })

  it(`removes flags people explicitly opt out of and ignores flags that don't pass semver`, () => {
    const response = handleFlags(
      activeFlags,
      { PARTIAL_RELEASE: false, PARTIAL_RELEASE_ONLY_NEW_LODASH: false },
      `develop`
    )
    expect(response.enabledConfigFlags).toHaveLength(0)
  })
})
