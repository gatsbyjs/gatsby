import React from "react"
import { render } from "react-testing-library"
import { graphql } from "gatsby"
import Helmet from "react-helmet"
import SEO from ".."

beforeEach(() => {
  graphql.mockClear()
  Helmet.mockClear()
})

const setup = (component, data) => {
  const mockGraphqlResult = data || {
    site: {
      siteMetadata: {
        title: `Gatsby SEO`,
        author: `Jay Gatsby`,
        description: `An amazing site that does something incredible`,
        siteUrl: `https://gatsbyjs.org`,
      },
    },
  }
  graphql.mockReturnValueOnce(mockGraphqlResult)

  const args = render(component)
  return {
    ...args,
    data: mockGraphqlResult,
  }
}

describe(`basic functionality`, () => {
  describe(`language`, () => {
    it(`adds default language`, () => {
      setup(<SEO title="Home" />)

      expect(Helmet).toHaveBeenCalledWith(
        expect.objectContaining({
          htmlAttributes: {
            lang: `en`,
          },
        }),
        expect.any(Object)
      )
    })

    it(`can pass custom language`, () => {
      const lang = `es`
      setup(<SEO title="Home" lang={lang} />)

      expect(Helmet).toHaveBeenCalledWith(
        expect.objectContaining({
          htmlAttributes: {
            lang,
          },
        }),
        expect.any(Object)
      )
    })
  })

  describe(`title`, () => {
    it(`adds title template placeholder`, () => {
      const { data } = setup(<SEO title="Hello" />)

      expect(Helmet).toHaveBeenCalledWith(
        expect.objectContaining({
          titleTemplate: `%s | ${data.site.siteMetadata.title}`,
        }),
        {}
      )
    })

    it(`can override title template`, () => {
      const titleTemplate = `%s | Hello`
      setup(<SEO title="asdf" titleTemplate={titleTemplate} />)

      expect(Helmet).toHaveBeenCalledWith(
        expect.objectContaining({
          titleTemplate,
        }),
        {}
      )
    })

    it(`adds title`, () => {
      const title = `Hello World`
      setup(<SEO title={title} />)

      expect(Helmet).toHaveBeenCalledWith(
        expect.objectContaining({
          title,
        }),
        expect.any(Object)
      )
    })
  })

  it(`forwards link prop`, () => {
    const link = [{ rel: `canonincal`, href: `https://gatsbyjs.org/links` }]
    setup(<SEO title="link prop" link={link} />)

    expect(Helmet).toHaveBeenCalledWith(
      expect.objectContaining({
        link: expect.arrayContaining(link),
      }),
      {}
    )
  })

  describe(`children/render props`, () => {
    it(`invokes with static query data`, () => {
      const render = jest.fn().mockReturnValue(null)
      const { data } = setup(<SEO title="Render props" render={render} />)

      expect(render).toHaveBeenCalledWith(data)
    })

    it(`works without render prop`, () => {
      expect(() => setup(<SEO title="No render prop" />)).not.toThrow()
    })

    it(`exposes children function prop`, () => {
      const children = jest.fn().mockReturnValueOnce(null)

      const { data } = setup(<SEO title="children prop">{children}</SEO>)

      expect(children).toHaveBeenCalledWith(data)
    })

    it(`works with react node child`, () => {
      expect(() =>
        setup(
          <SEO title="look a regular child">
            <meta name="something" content="something else" />
          </SEO>
        )
      ).not.toThrow()
    })
  })
})

describe(`og tags`, () => {
  test(`it adds og:type`, () => {
    setup(<SEO title="OG" />)

    expect(Helmet).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.arrayContaining([
          {
            property: `og:type`,
            content: `website`,
          },
        ]),
      }),
      {}
    )
  })

  test(`it adds og:description and og:title`, () => {
    const title = `OG`
    const { data } = setup(<SEO title={title} />)

    expect(Helmet).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.arrayContaining([
          {
            property: `og:title`,
            content: title,
          },
          {
            property: `og:description`,
            content: data.site.siteMetadata.description,
          },
        ]),
      }),
      {}
    )
  })
})

describe(`twitter`, () => {
  it(`adds twitter:card type of summary`, () => {
    setup(<SEO title="OG" />)

    expect(Helmet).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.arrayContaining([
          {
            name: `twitter:card`,
            content: `summary`,
          },
        ]),
      }),
      {}
    )
  })

  it(`adds expected twitter tags`, () => {
    const title = `twitter`
    const description = `something meaningful`
    setup(<SEO title={title} description={description} />)

    expect(Helmet).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.arrayContaining([
          {
            name: `twitter:title`,
            content: title,
          },
          {
            name: `twitter:description`,
            content: description,
          },
        ]),
      }),
      {}
    )
  })
})
