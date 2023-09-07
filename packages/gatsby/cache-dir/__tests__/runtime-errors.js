/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom"
import React from "react"
import { render } from "@testing-library/react"

import { RuntimeErrors } from "../fast-refresh-overlay/components/runtime-errors"

jest.mock(`../fast-refresh-overlay/helpers/focus-trap`, () => {
  const originalModule = jest.requireActual(
    `../fast-refresh-overlay/helpers/focus-trap`
  )
  return {
    _esModule: true,
    ...originalModule,
    default: function () {
      return { disengage: () => undefined }
    },
  }
})

test(`renders native Error info`, () => {
  const err = new Error(`boom`)

  const { getByText } = render(
    <RuntimeErrors dismiss={() => undefined} errors={[err, err, err]} />
  )

  const msg = getByText(new RegExp(err.message, `i`))

  expect(msg).toBeVisible()
})

test(`renders Error info without stack`, () => {
  const err = new Error(`boom`)
  delete err.stack

  const { getByText } = render(
    <RuntimeErrors dismiss={() => undefined} errors={[err, err, err]} />
  )

  const msg = getByText(new RegExp(err.message, `i`))

  expect(msg).toBeVisible()
})
