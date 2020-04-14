import React from "react"
import { fireEvent, render } from "@testing-library/react"
import { ThemeProvider } from "theme-ui"

import Sidebar from "../sidebar"
import { I18nProvider } from "../../I18nContext"
import theme from "../../../gatsby-plugin-theme-ui"

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

describe("sidebar", () => {
  describe("initialization", () => {
    it("opens sections with active items", () => {
      const { queryByText } = render(
        <ThemeProvider theme={theme}>
          <I18nProvider locale="en">
            <Sidebar
              itemList={itemList}
              location={{ pathname: "/characters/jay-gatsby/" }}
            />
          </I18nProvider>
        </ThemeProvider>
      )
      expect(queryByText("Jay Gatsby")).toBeInTheDocument()
    })

    it("opens sections that are open in local storage", () => {
      //
    })
  })

  describe("toggle section", () => {
    it("opens the section if it is not open", () => {
      const { queryByText, getByLabelText } = render(
        <ThemeProvider theme={theme}>
          <I18nProvider locale="en">
            <Sidebar
              itemList={itemList}
              location={{ pathname: "/plot-summary/" }}
            />
          </I18nProvider>
        </ThemeProvider>
      )
      fireEvent.click(getByLabelText(`Motifs expand`))
      expect(queryByText("The Green Light")).toBeInTheDocument()
    })

    it("closes the section if it is already opened", () => {
      const { queryByText, getByLabelText } = render(
        <ThemeProvider theme={theme}>
          <I18nProvider locale="en">
            <Sidebar
              itemList={itemList}
              location={{ pathname: "/motifs/green-light/" }}
            />
          </I18nProvider>
        </ThemeProvider>
      )
      fireEvent.click(getByLabelText(`Motifs collapse`))
      expect(queryByText("The Green Light")).not.toBeInTheDocument()
    })

    it("writes to local storage", () => {
      //
    })
  })

  describe("expand all", () => {
    it("opens all sections when not already expanded", () => {
      const { queryByText, getByText } = render(
        <ThemeProvider theme={theme}>
          <I18nProvider locale="en">
            <Sidebar
              itemList={itemList}
              location={{ pathname: "/plot-summary/" }}
            />
          </I18nProvider>
        </ThemeProvider>
      )
      fireEvent.click(getByText(`Expand All`))
      expect(queryByText("Jay Gatsby")).toBeInTheDocument()
      expect(queryByText("Daisy Buchanan")).toBeInTheDocument()
      expect(queryByText("The Green Light")).toBeInTheDocument()
    })

    xit("closes all sections except active items when already expanded", () => {
      const { queryByText, getByText } = render(
        <ThemeProvider theme={theme}>
          <I18nProvider locale="en">
            <Sidebar
              itemList={itemList}
              location={{ pathname: "/characters/jay-gatsby/" }}
            />
          </I18nProvider>
        </ThemeProvider>
      )
      fireEvent.click(getByText(`Collapse All`))
      expect(queryByText("Jay Gatsby")).toBeInTheDocument()
      expect(queryByText("The Buchanans")).toBeInTheDocument()
      expect(queryByText("Daisy Buchanan")).not.toBeInTheDocument()
      expect(queryByText("The Green Light")).not.toBeInTheDocument()
    })

    it("writes to local storage", () => {
      //
    })
  })
})
