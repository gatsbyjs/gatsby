import React from "react"
import { fireEvent, render } from "@testing-library/react"
import { ThemeProvider } from "theme-ui"

import Sidebar from "../sidebar"
import { I18nProvider } from "../../I18nContext"
import theme from "../../../gatsby-plugin-theme-ui"

class LocalStorageMock {
  store = {}

  getItem(key) {
    return this.store[key] ?? null
  }

  setItem(key, value) {
    this.store[key] = value
  }

  clear() {
    this.store = {}
  }
}

Object.defineProperty(window, "localStorage", {
  value: new LocalStorageMock(),
  writable: true,
})

// https://github.com/jsdom/jsdom/issues/1695
window.HTMLElement.prototype.scrollIntoView = jest.fn()

function extendItemList(itemList, parentTitle) {
  for (const item of itemList) {
    if (parentTitle) {
      item.parentTitle = parentTitle
    }
    if (item.items) {
      extendItemList(item.items, item.title)
    }
  }
  return itemList
}

const itemList = [
  { title: "Plot Summary", link: "/plot-summary/" },
  { title: "Themes", link: "/themes/" },
  {
    title: "Characters",
    link: "/characters/",
    items: [
      { title: "Jay Gatsby", link: "/characters/jay-gatsby/" },
      { title: "Nick Carraway", link: "/characters/nick-carraway/" },
      {
        title: "The Buchanans",
        link: "/characters/buchanan/",
        items: [
          { title: "Daisy Buchanan", link: "/characters/daisy-buchanan/" },
          { title: "Tom Buchanan", link: "/characters/tom-buchanan/" },
        ],
      },
    ],
  },
  {
    title: "Motifs",
    link: "/motifs/",
    items: [
      { title: "The Green Light", link: "/motifs/green-light/" },
      { title: "The Eyes of Dr. T.J. Eckleburg", link: "/motifs/eyes/" },
    ],
  },
]

function renderSidebar(pathname) {
  return render(
    <ThemeProvider theme={theme}>
      <I18nProvider locale="en">
        <Sidebar
          title="The Great Gatsby"
          sidebarKey="great-gatsby"
          itemList={extendItemList(itemList)}
          location={{ pathname }}
        />
      </I18nProvider>
    </ThemeProvider>
  )
}

describe("sidebar", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe("initialization", () => {
    it("opens sections with active items", () => {
      const { queryByText } = renderSidebar("/characters/jay-gatsby/")
      expect(queryByText("Jay Gatsby")).toBeInTheDocument()
    })

    it("opens sections based on local storage", () => {
      // Render a page
      renderSidebar("/characters/jay-gatsby/").unmount()
      // Render a new page and check that the previous opened section
      // is still open
      const { queryByText } = renderSidebar("/plot-summary/")
      expect(queryByText("Jay Gatsby")).toBeInTheDocument()
      expect(queryByText("Daisy Buchanan")).not.toBeInTheDocument()
    })
  })

  describe("toggle section", () => {
    it("opens the section if it is not open", () => {
      const { queryByText, getByLabelText } = renderSidebar("/plot-summary/")
      fireEvent.click(getByLabelText(`Motifs expand`))
      expect(queryByText("The Green Light")).toBeInTheDocument()
    })

    it("closes the section if it is already opened", () => {
      const { queryByText, getByLabelText } = renderSidebar("/motifs/")
      fireEvent.click(getByLabelText(`Motifs collapse`))
      expect(queryByText("The Green Light")).not.toBeInTheDocument()
    })
  })

  describe("expand all", () => {
    it("opens all sections when not already expanded", () => {
      const { queryByText, getByText } = renderSidebar("/plot-summary/")
      fireEvent.click(getByText(`Expand All`))
      expect(queryByText("Jay Gatsby")).toBeInTheDocument()
      expect(queryByText("Daisy Buchanan")).toBeInTheDocument()
      expect(queryByText("The Green Light")).toBeInTheDocument()
    })

    it("closes all sections except active items when already expanded", () => {
      const { queryByText, getByText } = renderSidebar(
        "/characters/jay-gatsby/"
      )
      fireEvent.click(getByText(`Expand All`))
      fireEvent.click(getByText(`Collapse All`))
      expect(queryByText("Jay Gatsby")).toBeInTheDocument()
      expect(queryByText("The Buchanans")).toBeInTheDocument()
      expect(queryByText("Daisy Buchanan")).not.toBeInTheDocument()
      expect(queryByText("The Green Light")).not.toBeInTheDocument()
    })
  })
})
