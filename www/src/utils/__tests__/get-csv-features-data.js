import { getFeaturesData } from "../get-csv-features-data"

const mockNodes = [
  {
    Category: `Performance`,
    Gatsby: `3`,
    Jamstack: `3`,
    Cms: `2`,
    Description: ``,
  },
  {
    Category: `Developer Experience`,
    Gatsby: `3`,
    Jamstack: `3`,
    Cms: `2`,
    Description: ``,
  },
  {
    Category: `Governance`,
    Gatsby: `3`,
    Jamstack: `2`,
    Cms: `3`,
    Description: ``,
  },
  {
    Category: `Accessibility`,
    Gatsby: `2`,
    Jamstack: `2`,
    Cms: `3`,
    Description: ``,
  },
  {
    Category: `Documentation`,
    Gatsby: `3`,
    Jamstack: `3`,
    Cms: `3`,
    Description: ``,
  },
  {
    Category: `Ecosystem`,
    Gatsby: `3`,
    Jamstack: `2`,
    Cms: `2`,
    Description: ``,
  },
]

test(`it gets the correct number of sections and headers`, () => {
  const { sections, sectionHeaders } = getFeaturesData(mockNodes)

  expect(sections).toBeDefined()
  expect(sections).toHaveLength(mockNodes.length)
  expect(sectionHeaders).toBeDefined()
  expect(sectionHeaders).toHaveLength(mockNodes.length)
})
