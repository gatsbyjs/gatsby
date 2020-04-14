import React from "react"
import { render } from "@testing-library/react"

import Sidebar from "../sidebar"

describe("sidebar", () => {
  it("opens sections with active items and local storage", () => {
    render(<Sidebar />)
    //
  })

  describe("toggle section", () => {
    it("opens the section if it is not open", () => {
      render(<Sidebar />)
      //
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
