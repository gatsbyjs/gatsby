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
      noCi: true,
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

  it(`returns validConfigFlags and a message`, () => {
    expect(handleFlags(activeFlags, configFlags, `develop`)).toMatchSnapshot()
  })

  it(`filters out flags marked false`, () => {
    expect(
      handleFlags(activeFlags, configFlagsWithFalse, `develop`)
        .enabledConfigFlags
    ).toHaveLength(1)
  })

  it(`filters out flags that are marked as not available on CI`, () => {
    expect(
      handleFlags(activeFlags, configWithFlagsNoCi, `develop`)
        .enabledConfigFlags
    ).toHaveLength(1)
  })

  it(`filters out flags that aren't for the current command`, () => {
    expect(
      handleFlags(activeFlags, configFlags, `build`).enabledConfigFlags
    ).toHaveLength(1)
  })

  it(`returns a message about unknown flags in the config`, () => {
    const unknownConfigFlags = handleFlags(
      activeFlags,
      { ALL_COMMANDS: true, FASTLY_DEV: true, SUPER_COOL_FLAG: true },
      `develop`
    )
    expect(unknownConfigFlags).toMatchSnapshot()
  })
})
