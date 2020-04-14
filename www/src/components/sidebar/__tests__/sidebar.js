import React from "react"
import { render } from "@testing-library/react"
import { ThemeProvider } from "theme-ui"

import Sidebar from "../sidebar"
import { I18nProvider } from "../../I18nContext"
import theme from "../../../gatsby-plugin-theme-ui"

const itemList = [
  { title: "Item 1", link: "/item-1/" },
  {
    title: "Section 1",
    link: "/section-1/",
    items: [
      { title: "Subitem 1", link: "/section-1/subitem-1/" },
      { title: "Subitem 2", link: "/section-1/subitem-2/" },
    ],
  },
  {
    title: "Section 2",
    link: "/section-2/",
    items: [
      { title: "Subitem 1", link: "/section-2/subitem-1/" },
      { title: "Subitem 2", link: "/section-2/subitem-2/" },
    ],
  },
]

describe("sidebar", () => {
  describe("initialization", () => {
    it("opens sections with active items", () => {
      //
    })

    it("opens sections that are open in local storage", () => {
      //
    })
  })

  describe("toggle section", () => {
    it("opens the section if it is not open", () => {
      render(
        <ThemeProvider theme={theme}>
          <I18nProvider locale="en">
            <Sidebar itemList={itemList} />
          </I18nProvider>
        </ThemeProvider>
      )
    })

    it("closes the section if it is already opened", () => {
      //
    })

    it("writes to local storage", () => {
      //
    })
  })

  describe("expand all", () => {
    it("opens all sections when not already expanded", () => {
      //
    })

    it("closes all sections except active items when already expanded", () => {
      //
    })

    it("writes to local storage", () => {
      //
    })
  })
})
