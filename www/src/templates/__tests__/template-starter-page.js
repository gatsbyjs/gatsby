jest.mock(`../../components/layout`, () => jest.fn(({ children }) => children))
import React from "react"
import { render } from "@testing-library/react"
import { ThemeProvider } from "theme-ui"
import { I18nProvider } from "@lingui/react"

import theme from "../../../src/gatsby-plugin-theme-ui"
import StarterTemplate from "../template-starter-page"

const getMockImage = () => {
  return {
    sizes: `1234`,
    src: `1234`,
    srcSet: `1234 1234 1324`,
    aspectRatio: 3 / 4,
  }
}

const getProps = (starter = {}, fallback = {}) => {
  return {
    data: {
      fallback,
      startersYaml: {
        id: `1234`,
        fields: {
          starterShowcase: {
            slug: `/slug/1234`,
            stub: false,
            description: `1234`,
            stars: 100,
            lastUpdated: new Date(`10/08/1990`),
            owner: `dschau`,
            name: `some-starter`,
            githubFullName: `dustin`,
            allDependencies: [],
            gatsbyDependencies: [],
            miscDependencies: [],
          },
        },
        url: `www.google.com`,
        repo: `asdf`,
        description: `1234`,
        tags: [],
        features: [],
        internal: {
          type: `StarterYaml`,
        },
        childScreenshot: {
          screenshotFile: {
            childImageSharp: {
              fluid: getMockImage(),
              resize: {
                src: `1234`,
              },
            },
          },
        },
        ...starter,
      },
    },
    location: {
      pathname: `/starters/1234`,
    },
  }
}

test(`it can be rendered`, () => {
  expect(() =>
    render(
      <I18nProvider>
        <ThemeProvider theme={theme}>
          <StarterTemplate {...getProps()} />
        </ThemeProvider>
      </I18nProvider>
    )
  ).not.toThrow()
})

test(`it displays a screenshot`, () => {
  const props = getProps()
  const { getByAltText } = render(
    <I18nProvider>
      <ThemeProvider theme={theme}>
        <StarterTemplate {...props} />
      </ThemeProvider>
    </I18nProvider>
  )

  expect(
    getByAltText(
      `Screenshot of ${props.data.startersYaml.fields.starterShowcase.name}`
    )
  ).toBeInTheDocument()
})

test(`it falls back to fallback screenshot, if screenshot file not found`, () => {
  const props = getProps(
    {
      childScreenshot: {
        screenshotFile: null,
      },
    },
    {
      childImageSharp: {
        fluid: getMockImage(),
        resize: {
          src: `1234`,
        },
      },
    }
  )

  expect(() =>
    render(
      <I18nProvider>
        <ThemeProvider theme={theme}>
          <StarterTemplate {...props} />
        </ThemeProvider>
      </I18nProvider>
    )
  ).not.toThrow()
})
