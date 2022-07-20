/**
 * @jest-environment jsdom
 */

import React from "react"
import {
  LocationProvider,
  History,
  createMemorySource,
  createHistory,
} from "@reach/router"
import { render, fireEvent } from "@testing-library/react"
import { useScrollRestoration } from "../use-scroll-restoration"
import { ScrollHandler } from "../scroll-handler"
import { SessionStorage } from "../session-storage"

const TRUE = (): boolean => true

const Fixture: React.FunctionComponent = () => {
  const scrollRestorationProps = useScrollRestoration<HTMLDivElement>(`test`)
  return (
    <div
      {...scrollRestorationProps}
      style={{ overflow: `auto` }}
      data-testid="scrollfixture"
    >
      Test
    </div>
  )
}

describe(`useScrollRestoration`, () => {
  let history: History
  const session = new SessionStorage()
  let htmlElementPrototype: HTMLElement
  let fakedScrollTo = false

  beforeAll(() => {
    const wrapper = render(<div>hello</div>)
    htmlElementPrototype = wrapper.container.constructor.prototype

    // jsdom doesn't support .scrollTo(), lets fix this temporarily
    if (typeof htmlElementPrototype.scrollTo === `undefined`) {
      htmlElementPrototype.scrollTo = function scrollTo(
        optionsOrX?: ScrollToOptions | number,
        y?: number
      ): void {
        if (typeof optionsOrX === `number`) {
          this.scrollLeft = optionsOrX
        }
        if (typeof y === `number`) {
          this.scrollTop = y
        }
      }
      fakedScrollTo = true
    }
  })

  beforeEach(() => {
    history = createHistory(createMemorySource(`/`))
    sessionStorage.clear()
  })

  afterAll(() => {
    if (fakedScrollTo && htmlElementPrototype.scrollTo) {
      // @ts-ignore
      delete htmlElementPrototype.scrollTo
    }
  })

  it(`stores current scroll position in storage`, () => {
    const wrapper = render(
      <LocationProvider history={history}>
        <ScrollHandler
          navigate={history.navigate}
          location={history.location}
          shouldUpdateScroll={TRUE}
        >
          <Fixture />
        </ScrollHandler>
      </LocationProvider>
    )

    fireEvent.scroll(wrapper.getByTestId(`scrollfixture`), {
      target: { scrollTop: 123 },
    })

    expect(session.read(history.location, `test`)).toBe(123)
  })

  it(`scrolls to stored offset on render`, () => {
    session.save(history.location, `test`, 684)

    const wrapper = render(
      <LocationProvider history={history}>
        <ScrollHandler
          navigate={history.navigate}
          location={history.location}
          shouldUpdateScroll={TRUE}
        >
          <Fixture />
        </ScrollHandler>
      </LocationProvider>
    )

    expect(wrapper.getByTestId(`scrollfixture`)).toHaveProperty(
      `scrollTop`,
      684
    )
  })

  it(`scrolls to 0 on render when session has no entry`, () => {
    const wrapper = render(
      <LocationProvider history={history}>
        <ScrollHandler
          navigate={history.navigate}
          location={history.location}
          shouldUpdateScroll={TRUE}
        >
          <Fixture />
        </ScrollHandler>
      </LocationProvider>
    )

    expect(wrapper.getByTestId(`scrollfixture`)).toHaveProperty(`scrollTop`, 0)
  })

  it(`updates scroll position on location change`, async () => {
    const wrapper = render(
      <LocationProvider history={history}>
        <ScrollHandler
          navigate={history.navigate}
          location={history.location}
          shouldUpdateScroll={TRUE}
        >
          <Fixture />
        </ScrollHandler>
      </LocationProvider>
    )

    fireEvent.scroll(wrapper.getByTestId(`scrollfixture`), {
      target: { scrollTop: 356 },
    })

    await history.navigate(`/another-location`)

    expect(wrapper.getByTestId(`scrollfixture`)).toHaveProperty(`scrollTop`, 0)
  })

  it(`restores scroll position when navigating back`, async () => {
    const wrapper = render(
      <LocationProvider history={history}>
        <ScrollHandler
          navigate={history.navigate}
          location={history.location}
          shouldUpdateScroll={TRUE}
        >
          <Fixture />
        </ScrollHandler>
      </LocationProvider>
    )

    fireEvent.scroll(wrapper.getByTestId(`scrollfixture`), {
      target: { scrollTop: 356 },
    })

    await history.navigate(`/another-location`)
    await history.navigate(-1)

    expect(wrapper.getByTestId(`scrollfixture`)).toHaveProperty(
      `scrollTop`,
      356
    )
  })
})
