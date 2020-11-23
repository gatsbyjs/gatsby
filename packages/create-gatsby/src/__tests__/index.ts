import Enquirer from "enquirer"
import { installPlugins } from "../install-plugins"
import { initStarter } from "../init-starter"
import { createCli, run, IAnswers } from "../"

jest.mock(`path`, () => {
  return {
    ...jest.requireActual(`path`),
    resolve: (): string => `/root/somewhere`,
  }
})
jest.mock(`../init-starter`)
jest.mock(`../install-plugins`)
jest.mock(`../tracking`)
jest.mock(`../get-config-store`)

describe(`create-gatsby-app`, () => {
  let cli: Enquirer<IAnswers>

  beforeEach(() => {
    cli = createCli()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it.only(`creates a project only using the project name`, async () => {
    cli.on(`prompt`, p => {
      p.on(`run`, async () => {
        switch (p.name) {
          case `project`:
            p.value = `my-super-project-name`
            break

          case `features`:
            await p.keypress(null, { name: `up` })

            break
        }

        p.submit()
      })
    })

    await run(cli)

    expect(initStarter).toBeCalledWith(
      `https://github.com/gatsbyjs/gatsby-starter-minimal.git`,
      `my-super-project-name`,
      []
    )
    expect(installPlugins).not.toBeCalled()
  })

  it.only(`creates a project with a project name and a CSS tool`, async () => {
    cli.on(`prompt`, p => {
      p.on(`run`, async () => {
        switch (p.name) {
          case `project`:
            p.value = `my-super-project-name`
            break

          case `features`:
            await p.keypress(null, { name: `up` })
            break

          case `styling`:
            await p.keypress(null, { name: `down` })
            break
        }

        p.submit()
      })
    })

    await run(cli)

    expect(
      initStarter
    ).toBeCalledWith(
      `https://github.com/gatsbyjs/gatsby-starter-minimal.git`,
      `my-super-project-name`,
      [`gatsby-plugin-postcss`, `postcss`]
    )
    expect(installPlugins).toBeCalledWith(
      [`gatsby-plugin-postcss`],
      {},
      `/root/somewhere`,
      []
    )
  })

  it(`creates a project with a project name and a CMS`, async () => {
    cli.on(`prompt`, p => {
      p.on(`run`, async () => {
        switch (p.name) {
          case `project`:
            p.value = `my-super-project-name`
            break

          case `features`:
            await p.keypress(null, { name: `up` })
            break

          case `cms`:
            await p.keypress(null, { name: `down` })
            break

          case `gatsby-source-wordpress-experimental`:
            await p.keypress(`a`)
            await p.keypress(`b`)
            await p.keypress(`c`)
            break
        }

        p.submit()
      })
    })

    await run(cli)

    expect(
      initStarter
    ).toBeCalledWith(
      `https://github.com/ascorbic/gatsby-starter-hello-world.git`,
      `my-super-project-name`,
      [`gatsby-source-wordpress-experimental`]
    )
    expect(installPlugins).toBeCalledWith(
      [`gatsby-source-wordpress-experimental`],
      {
        "gatsby-source-wordpress-experimental": {
          url: `abc`,
        },
      },
      `/root/somewhere`,
      []
    )
  })

  it(`creates a project with a project name, a CMS, a styling system, and google analytics`, async () => {
    cli.on(`prompt`, p => {
      p.on(`run`, async () => {
        switch (p.name) {
          case `project`:
            p.value = `my-super-project-name`
            break

          case `styling`:
            await p.keypress(null, { name: `down` })
            break

          case `features`:
            await p.keypress(null, { name: `enter` })
            await p.keypress(null, { name: `up` })
            break

          case `cms`:
            await p.keypress(null, { name: `down` })
            break

          case `gatsby-source-wordpress-experimental`:
            await p.keypress(`a`)
            await p.keypress(`b`)
            await p.keypress(`c`)
            break

          case `gatsby-plugin-google-analytics`:
            await p.keypress(`c`)
            await p.keypress(`d`)
            await p.keypress(`e`)
            break
        }

        p.submit()
      })
    })

    await run(cli)

    expect(
      initStarter
    ).toBeCalledWith(
      `https://github.com/ascorbic/gatsby-starter-hello-world.git`,
      `my-super-project-name`,
      [
        `gatsby-source-wordpress-experimental`,
        `gatsby-plugin-postcss`,
        `postcss`,
        `gatsby-plugin-google-analytics`,
      ]
    )
    expect(installPlugins).toBeCalledWith(
      [
        `gatsby-source-wordpress-experimental`,
        `gatsby-plugin-postcss`,
        `gatsby-plugin-google-analytics`,
      ],
      {
        "gatsby-source-wordpress-experimental": {
          url: `abc`,
        },
        "gatsby-plugin-google-analytics": {
          trackingId: `cde`,
        },
      },
      `/root/somewhere`,
      []
    )
  })
})
