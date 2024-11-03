import _ from "lodash"

import handleFlags from "../handle-flags"
import { IFlag, satisfiesSemvers, fitnessEnum } from "../flags"

jest.mock(`gatsby-core-utils`, () => {
  return {
    isCI: (): boolean => true,
  }
})

describe(`satisfies semver`, () => {
  it(`returns false if a module doesn't exist`, () => {
    const semverConstraints = {
      // Because of this, this flag will never show up
      "gatsby-plugin-sharpy": `>=2.10.0`,
    }
    expect(satisfiesSemvers(semverConstraints)).toBeFalsy()
  })
})

describe(`handle flags`, () => {
  const activeFlags: Array<IFlag> = [
    {
      name: `FAST_DEV`,
      env: `GATSBY_EXPERIMENTAL_FAST_DEV`,
      command: `develop`,
      telemetryId: `test`,
      experimental: false,
      description: `Enable all experiments aimed at improving develop server start time`,
      includedFlags: [`DEV_SSR`, `QUERY_ON_DEMAND`],
      testFitness: (): fitnessEnum => true,
    },
    {
      name: `DEV_SSR`,
      env: `GATSBY_EXPERIMENTAL_DEV_SSR`,
      command: `develop`,
      telemetryId: `test`,
      experimental: false,
      description: `SSR pages on full reloads during develop. Helps you detect SSR bugs and fix them without needing to do full builds.`,
      umbrellaIssue: `https://github.com/gatsbyjs/gatsby/discussions/28138`,
      testFitness: (): fitnessEnum => true,
    },
    {
      name: `QUERY_ON_DEMAND`,
      env: `GATSBY_EXPERIMENTAL_QUERY_ON_DEMAND`,
      command: `develop`,
      telemetryId: `test`,
      experimental: false,
      description: `Only run queries when needed instead of running all queries upfront. Speeds starting the develop server.`,
      umbrellaIssue: `https://github.com/gatsbyjs/gatsby/discussions/27620`,
      noCI: true,
      testFitness: (): fitnessEnum => true,
    },
    {
      name: `ONLY_BUILDS`,
      env: `GATSBY_EXPERIMENTAL_BUILD_ME_FASTER`,
      command: `build`,
      telemetryId: `test`,
      experimental: false,
      description: `test`,
      umbrellaIssue: `test`,
      testFitness: (): fitnessEnum => true,
    },
    {
      name: `ALL_COMMANDS`,
      env: `GATSBY_EXPERIMENTAL_SOMETHING_COOL`,
      command: `all`,
      telemetryId: `test`,
      experimental: false,
      description: `test`,
      umbrellaIssue: `test`,
      testFitness: (): fitnessEnum => true,
    },
    {
      name: `YET_ANOTHER`,
      env: `GATSBY_EXPERIMENTAL_SOMETHING_COOL2`,
      command: `all`,
      telemetryId: `test`,
      experimental: false,
      description: `test`,
      umbrellaIssue: `test`,
      testFitness: (): fitnessEnum => true,
    },
    {
      name: `PARTIAL_RELEASE`,
      env: `GATSBY_READY_TO_GO`,
      command: `all`,
      telemetryId: `test`,
      experimental: false,
      description: `test`,
      umbrellaIssue: `test`,
      testFitness: (): fitnessEnum => `OPT_IN`,
    },
    {
      name: `PARTIAL_RELEASE_ONLY_VERY_OLD_LODASH`,
      env: `GATSBY_READY_TO_GO_LODASH`,
      command: `all`,
      telemetryId: `test`,
      experimental: false,
      description: `test`,
      umbrellaIssue: `test`,
      testFitness: (flag): fitnessEnum => {
        const semver = {
          // Because of this, this flag will never show up
          lodash: `<=3.9`,
        }
        if (satisfiesSemvers(semver)) {
          return `OPT_IN`
        } else {
          return false
        }
      },
    },
    {
      name: `PARTIAL_RELEASE_ONLY_NEW_LODASH`,
      env: `GATSBY_READY_TO_GO_NEW_LODASH`,
      command: `all`,
      description: `test`,
      umbrellaIssue: `test`,
      telemetryId: `test`,
      experimental: false,
      testFitness: (flag): fitnessEnum => {
        const semver = {
          // Because of this, this flag will never show up
          lodash: `>=4.9`,
        }
        if (satisfiesSemvers(semver)) {
          return `OPT_IN`
        } else {
          return false
        }
      },
    },
    {
      name: `LMDB_NODE14_ONLY`,
      env: `GATSBY_LMDB`,
      command: `all`,
      description: `test`,
      umbrellaIssue: `test`,
      telemetryId: `test`,
      experimental: false,
      testFitness: (): fitnessEnum => false,
      requires: `Requires Node 14.10+`,
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
    const result = handleFlags(activeFlags, configFlagsWithFalse, `develop`)
    expect(result.enabledConfigFlags).toHaveLength(3)
    expect(result).toMatchSnapshot()
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

  it(`returns a message about unfit flags in the config`, () => {
    const unfitConfigFlags = handleFlags(
      activeFlags,
      { LMDB_NODE14_ONLY: true },
      `develop`
    )
    expect(unfitConfigFlags.enabledConfigFlags).not.toContain(
      expect.objectContaining({
        name: `LMDB_NODE14_ONLY`,
      })
    )
    expect(unfitConfigFlags.unfitFlagMessage).toMatchInlineSnapshot(`
      "The following flag(s) found in your gatsby-config.js are not supported in your environment and will have no effect:
      - LMDB_NODE14_ONLY: Requires Node 14.10+"
    `)
    expect(unfitConfigFlags.unknownFlagMessage).toEqual(``)
  })

  it(`opts in sites to a flag if their site is selected for partial release`, () => {
    // Nothing is enabled in their config.
    const response = handleFlags(activeFlags, {}, `develop`)
    expect(response).toMatchSnapshot()
  })

  it(`removes flags people explicitly opt out of and ignores flags that don't pass semver`, () => {
    const response = handleFlags(
      activeFlags,
      {
        PARTIAL_RELEASE: false,
        PARTIAL_RELEASE_ONLY_NEW_LODASH: false,
      },
      `develop`
    )
    expect(response.enabledConfigFlags).toHaveLength(0)
  })

  it(`doesn't count unfit flags as unknown`, () => {
    const response = handleFlags(
      activeFlags,
      {
        PARTIAL_RELEASE_ONLY_VERY_OLD_LODASH: true,
        PARTIAL_RELEASE: false,
        PARTIAL_RELEASE_ONLY_NEW_LODASH: false,
      },
      `develop`
    )

    // it currently just silently disables it
    expect(response).toMatchInlineSnapshot(`
      Object {
        "enabledConfigFlags": Array [],
        "message": "",
        "unfitFlagMessage": "The following flag(s) found in your gatsby-config.js are not supported in your environment and will have no effect:
      - PARTIAL_RELEASE_ONLY_VERY_OLD_LODASH",
        "unknownFlagMessage": "",
      }
    `)
  })

  it(`Prefers explicit opt-in over auto opt-in (for terminal message)`, () => {
    const response = handleFlags(
      activeFlags.concat([
        {
          name: `ALWAYS_OPT_IN`,
          env: `GATSBY_ALWAYS_OPT_IN`,
          command: `all`,
          description: `test`,
          umbrellaIssue: `test`,
          telemetryId: `test`,
          experimental: false,
          // this will always OPT IN
          testFitness: (): fitnessEnum => `OPT_IN`,
        },
      ]),
      {
        ALWAYS_OPT_IN: true,
        DEV_SSR: true,
        PARTIAL_RELEASE: false,
        PARTIAL_RELEASE_ONLY_NEW_LODASH: false,
      },
      `develop`
    )

    expect(response.message).not.toContain(`automatically enabled`)
    expect(response.message).toMatchInlineSnapshot(`
      "The following flags are active:
      - ALWAYS_OPT_IN · (Umbrella Issue (test)) · test
      - DEV_SSR · (Umbrella Issue (https://github.com/gatsbyjs/gatsby/discussions/28138)) · SSR pages on full reloads during develop. Helps you detect SSR bugs and fix them without needing to do full builds.

      There are 3 other flags available that you might be interested in:
      - FAST_DEV · Enable all experiments aimed at improving develop server start time
      - ALL_COMMANDS · (Umbrella Issue (test)) · test
      - YET_ANOTHER · (Umbrella Issue (test)) · test
      "
    `)
  })

  describe(`LOCKED_IN`, () => {
    it(`Enables locked in flag by default and doesn't mention it in terminal (no spam)`, () => {
      const response = handleFlags(
        [
          {
            name: `ALWAYS_LOCKED_IN`,
            env: `GATSBY_ALWAYS_LOCKED_IN`,
            command: `all`,
            description: `test`,
            umbrellaIssue: `test`,
            telemetryId: `test`,
            experimental: false,
            // this will always LOCKED IN
            testFitness: (): fitnessEnum => `LOCKED_IN`,
          },
        ],
        {},
        `develop`
      )

      expect(response.enabledConfigFlags).toContainEqual(
        expect.objectContaining({ name: `ALWAYS_LOCKED_IN` })
      )
      expect(response.message).toEqual(``)
    })

    it(`Display message saying config flag for LOCKED_IN feature is no-op`, () => {
      const response = handleFlags(
        [
          {
            name: `ALWAYS_LOCKED_IN_SET_IN_CONFIG`,
            env: `GATSBY_ALWAYS_LOCKED_IN_SET_IN_CONFIG`,
            command: `all`,
            description: `test`,
            umbrellaIssue: `test`,
            telemetryId: `test`,
            experimental: false,
            // this will always LOCKED IN
            testFitness: (): fitnessEnum => `LOCKED_IN`,
          },
        ],
        {
          // this has no effect, but we want to show to user that
          ALWAYS_LOCKED_IN_SET_IN_CONFIG: true,
        },
        `develop`
      )

      expect(response.enabledConfigFlags).toContainEqual(
        expect.objectContaining({ name: `ALWAYS_LOCKED_IN_SET_IN_CONFIG` })
      )
      expect(response.message).toMatchInlineSnapshot(`
        "Some features you configured with flags are used natively now.
        Those flags no longer have any effect and you can remove them from config:
        - ALWAYS_LOCKED_IN_SET_IN_CONFIG · (Umbrella Issue (test)) · test
        "
      `)
    })

    it(`Display message when LOCKED_IN applies to command different than currently executed`, () => {
      const response = handleFlags(
        [
          {
            name: `ALWAYS_LOCKED_IN_SET_IN_CONFIG_FOR_DEVELOP`,
            env: `GATSBY_ALWAYS_LOCKED_IN_SET_IN_CONFIG_FOR_DEVELOP`,
            command: `develop`,
            description: `test`,
            umbrellaIssue: `test`,
            telemetryId: `test`,
            experimental: false,
            // this will always LOCKED IN
            testFitness: (): fitnessEnum => `LOCKED_IN`,
          },
          {
            name: `SOME_FLAG`,
            env: `GATSBY_SOME_FLAG`,
            command: `all`,
            description: `test`,
            umbrellaIssue: `test`,
            telemetryId: `test`,
            experimental: false,
            testFitness: (): fitnessEnum => true,
          },
        ],
        {
          // this has no effect, but we want to show to user that
          SOME_FLAG: true,
        },
        `build`
      )

      expect(response).toMatchInlineSnapshot(`
        Object {
          "enabledConfigFlags": Array [
            Object {
              "command": "all",
              "description": "test",
              "env": "GATSBY_SOME_FLAG",
              "experimental": false,
              "name": "SOME_FLAG",
              "telemetryId": "test",
              "testFitness": [Function],
              "umbrellaIssue": "test",
            },
          ],
          "message": "The following flags are active:
        - SOME_FLAG · (Umbrella Issue (test)) · test
        ",
          "unfitFlagMessage": "",
          "unknownFlagMessage": "",
        }
      `)
    })

    it(`Kitchen sink`, () => {
      const response = handleFlags(
        activeFlags.concat([
          {
            name: `ALWAYS_LOCKED_IN`,
            env: `GATSBY_ALWAYS_LOCKED_IN`,
            command: `all`,
            description: `test`,
            umbrellaIssue: `test`,
            telemetryId: `test`,
            experimental: false,
            // this will always LOCKED IN
            testFitness: (): fitnessEnum => `LOCKED_IN`,
          },
          {
            name: `ALWAYS_LOCKED_IN_SET_IN_CONFIG`,
            env: `GATSBY_ALWAYS_LOCKED_IN_SET_IN_CONFIG`,
            command: `all`,
            description: `test`,
            umbrellaIssue: `test`,
            telemetryId: `test`,
            experimental: false,
            // this will always LOCKED IN
            testFitness: (): fitnessEnum => `LOCKED_IN`,
          },
        ]),
        {
          ALWAYS_OPT_IN: true,
          DEV_SSR: true,
          PARTIAL_RELEASE: false,
          PARTIAL_RELEASE_ONLY_NEW_LODASH: false,
          // this has no effect, but we want to show to user that
          ALWAYS_LOCKED_IN_SET_IN_CONFIG: true,
        },
        `develop`
      )

      // this is enabled, but because it's not configurable anymore and user doesn't set it explicitly in config - there is no point in printing information about it
      expect(response.enabledConfigFlags).toContainEqual(
        expect.objectContaining({ name: `ALWAYS_LOCKED_IN` })
      )
      // this is enabled, but because it's not configurable anymore and user sets it in config - we want to mention that this config flag has no effect anymore
      expect(response.enabledConfigFlags).toContainEqual(
        expect.objectContaining({ name: `ALWAYS_LOCKED_IN_SET_IN_CONFIG` })
      )
      expect(response.message).toMatchInlineSnapshot(`
        "The following flags are active:
        - DEV_SSR · (Umbrella Issue (https://github.com/gatsbyjs/gatsby/discussions/28138)) · SSR pages on full reloads during develop. Helps you detect SSR bugs and fix them without needing to do full builds.

        Some features you configured with flags are used natively now.
        Those flags no longer have any effect and you can remove them from config:
        - ALWAYS_LOCKED_IN_SET_IN_CONFIG · (Umbrella Issue (test)) · test

        There are 3 other flags available that you might be interested in:
        - FAST_DEV · Enable all experiments aimed at improving develop server start time
        - ALL_COMMANDS · (Umbrella Issue (test)) · test
        - YET_ANOTHER · (Umbrella Issue (test)) · test
        "
      `)
    })
  })

  describe(`includeFlags`, () => {
    it(`enabling umbrella flag implies enabling individual flags`, () => {
      const response = handleFlags(
        [
          {
            name: `UMBRELLA`,
            env: `GATSBY_UMBRELLA`,
            command: `all`,
            description: `test`,
            umbrellaIssue: `test`,
            telemetryId: `test`,
            experimental: false,
            testFitness: (): fitnessEnum => true,
            includedFlags: [`SUB_FLAG_A`, `SUB_FLAG_B`],
          },
          {
            name: `SUB_FLAG_A`,
            env: `GATSBY_SUB_FLAG_A`,
            command: `all`,
            description: `test`,
            umbrellaIssue: `test`,
            telemetryId: `test`,
            experimental: false,
            testFitness: (): fitnessEnum => true,
          },
          {
            name: `SUB_FLAG_B`,
            env: `GATSBY_SUB_FLAG_B`,
            command: `all`,
            description: `test`,
            umbrellaIssue: `test`,
            telemetryId: `test`,
            experimental: false,
            testFitness: (): fitnessEnum => true,
          },
        ],
        {
          UMBRELLA: true,
        },
        `build`
      )

      expect(response.enabledConfigFlags).toContainEqual(
        expect.objectContaining({ name: `SUB_FLAG_A` })
      )
      expect(response.enabledConfigFlags).toContainEqual(
        expect.objectContaining({ name: `SUB_FLAG_B` })
      )
      expect(response.message).toMatchInlineSnapshot(`
        "The following flags are active:
        - UMBRELLA · (Umbrella Issue (test)) · test
        - SUB_FLAG_A · (Umbrella Issue (test)) · test
        - SUB_FLAG_B · (Umbrella Issue (test)) · test
        "
      `)
    })

    it(`allow disabling individual flags that umbrella flag would enable`, () => {
      const response = handleFlags(
        [
          {
            name: `UMBRELLA`,
            env: `GATSBY_UMBRELLA`,
            command: `all`,
            description: `test`,
            umbrellaIssue: `test`,
            telemetryId: `test`,
            experimental: false,
            testFitness: (): fitnessEnum => true,
            includedFlags: [`SUB_FLAG_A`, `SUB_FLAG_B`],
          },
          {
            name: `SUB_FLAG_A`,
            env: `GATSBY_SUB_FLAG_A`,
            command: `all`,
            description: `test`,
            umbrellaIssue: `test`,
            telemetryId: `test`,
            experimental: false,
            testFitness: (): fitnessEnum => true,
          },
          {
            name: `SUB_FLAG_B`,
            env: `GATSBY_SUB_FLAG_B`,
            command: `all`,
            description: `test`,
            umbrellaIssue: `test`,
            telemetryId: `test`,
            experimental: false,
            testFitness: (): fitnessEnum => true,
          },
        ],
        {
          UMBRELLA: true,
          SUB_FLAG_B: false,
        },
        `build`
      )

      expect(response.enabledConfigFlags).toContainEqual(
        expect.objectContaining({ name: `SUB_FLAG_A` })
      )
      expect(response.enabledConfigFlags).not.toContainEqual(
        expect.objectContaining({ name: `SUB_FLAG_B` })
      )
      expect(response.message).toMatchInlineSnapshot(`
        "The following flags are active:
        - UMBRELLA · (Umbrella Issue (test)) · test
        - SUB_FLAG_A · (Umbrella Issue (test)) · test
        "
      `)
    })
  })

  describe(`other flag suggestions`, () => {
    it(`suggest other flags when there is flag explicitly enabled`, () => {
      const response = handleFlags(
        [
          {
            name: `ENABLED_FLAG`,
            env: `GATSBY_ENABLED_FLAG`,
            command: `all`,
            description: `test`,
            umbrellaIssue: `test`,
            telemetryId: `test`,
            experimental: false,
            testFitness: (): fitnessEnum => true,
          },
          {
            name: `OTHER_FLAG`,
            env: `GATSBY_OTHER_FLAG`,
            command: `all`,
            description: `test`,
            umbrellaIssue: `test`,
            telemetryId: `test`,
            experimental: false,
            testFitness: (): fitnessEnum => true,
          },
        ],
        {
          ENABLED_FLAG: true,
        },
        `build`
      )

      expect(response.message).toMatchInlineSnapshot(`
        "The following flags are active:
        - ENABLED_FLAG · (Umbrella Issue (test)) · test

        There is one other flag available that you might be interested in:
        - OTHER_FLAG · (Umbrella Issue (test)) · test
        "
      `)
    })

    it(`suggest other flags when there is opted-in flag`, () => {
      const response = handleFlags(
        [
          {
            name: `OPTED_IN_FLAG`,
            env: `GATSBY_OPTED_IN_FLAG`,
            command: `all`,
            description: `test`,
            umbrellaIssue: `test`,
            telemetryId: `test`,
            experimental: false,
            testFitness: (): fitnessEnum => `OPT_IN`,
          },
          {
            name: `OTHER_FLAG`,
            env: `GATSBY_OTHER_FLAG`,
            command: `all`,
            description: `test`,
            umbrellaIssue: `test`,
            telemetryId: `test`,
            experimental: false,
            testFitness: (): fitnessEnum => true,
          },
        ],
        {},
        `build`
      )

      expect(response.message).toMatchInlineSnapshot(`
        "We're shipping new features! For final testing, we're rolling them out first to a small % of Gatsby users
        and your site was automatically chosen as one of them. With your help, we'll then release them to everyone in the next minor release.

        We greatly appreciate your help testing the change. Please report any feedback good or bad in the umbrella issue. If you do encounter problems, please disable the flag by setting it to false in your gatsby-config.js like:

        flags: {
          THE_FLAG: false
        }

        The following flags were automatically enabled on your site:
        - OPTED_IN_FLAG · (Umbrella Issue (test)) · test

        There is one other flag available that you might be interested in:
        - OTHER_FLAG · (Umbrella Issue (test)) · test
        "
      `)
    })

    it(`doesn't suggest other flags if there are no enabled or opted in flags (no locked-in flags)`, () => {
      const response = handleFlags(
        [
          {
            name: `SOME_FLAG`,
            env: `GATSBY_SOME_FLAG`,
            command: `all`,
            description: `test`,
            umbrellaIssue: `test`,
            telemetryId: `test`,
            experimental: false,
            testFitness: (): fitnessEnum => true,
          },
          {
            name: `OTHER_FLAG`,
            env: `GATSBY_OTHER_FLAG`,
            command: `all`,
            description: `test`,
            umbrellaIssue: `test`,
            telemetryId: `test`,
            experimental: false,
            testFitness: (): fitnessEnum => true,
          },
        ],
        {},
        `build`
      )

      expect(response.message).toMatchInlineSnapshot(`""`)
    })

    it(`doesn't suggest other flags if there are no enabled or opted in flags (with locked-in flag)`, () => {
      const response = handleFlags(
        [
          {
            name: `LOCKED_IN_FLAG`,
            env: `GATSBY_LOCKED_IN_FLAG`,
            command: `all`,
            description: `test`,
            umbrellaIssue: `test`,
            telemetryId: `test`,
            experimental: false,
            testFitness: (): fitnessEnum => `LOCKED_IN`,
          },
          {
            name: `OTHER_FLAG`,
            env: `GATSBY_OTHER_FLAG`,
            command: `all`,
            description: `test`,
            umbrellaIssue: `test`,
            telemetryId: `test`,
            experimental: false,
            testFitness: (): fitnessEnum => true,
          },
        ],
        {},
        `build`
      )

      expect(response.message).toMatchInlineSnapshot(`""`)
    })
  })
})
