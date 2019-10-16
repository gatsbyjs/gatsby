import { getFeaturesData } from "../get-csv-features-data"

const mockEdges = [
  {
    node: {
      Category: `Performance`,
      Gatsby: `3`,
      Jamstack: `3`,
      Cms: `2`,
      Description: ``,
    },
  },
  {
    node: {
      Category: `Developer Experience`,
      Gatsby: `3`,
      Jamstack: `3`,
      Cms: `2`,
      Description: ``,
    },
  },
  {
    node: {
      Category: `Governance`,
      Gatsby: `3`,
      Jamstack: `2`,
      Cms: `3`,
      Description: ``,
    },
  },
  {
    node: {
      Category: `Accessibility`,
      Gatsby: `2`,
      Jamstack: `2`,
      Cms: `3`,
      Description: ``,
    },
  },
  {
    node: {
      Category: `Documentation`,
      Gatsby: `3`,
      Jamstack: `3`,
      Cms: `3`,
      Description: ``,
    },
  },
  {
    node: {
      Category: `Ecosystem`,
      Gatsby: `3`,
      Jamstack: `2`,
      Cms: `2`,
      Description: ``,
    },
  },
]

test(`it gets the correct number of sections and headers`, () => {
  const { sections, sectionHeaders } = getFeaturesData(mockEdges)

  expect(sections).toBeDefined()
  expect(sections).toHaveLength(mockEdges.length)
  expect(sectionHeaders).toBeDefined()
  expect(sectionHeaders).toHaveLength(mockEdges.length)
})
