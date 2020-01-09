---
title: "Pragmatic Lessons from Converting to React Hooks"
date: 2019-02-07
author: Daniel Lemay
tags:
  - react
image: "./images/hooks-diff.jpg"
showImageInArticle: true
canonicalLink: "https://www.dslemay.com/blog/2019/02/06/pragmatic-lessons-from-converting-to-react-hooks"
---

Last week I decided to install the React 16.8 alpha on a branch and experiment with React Hooks in preparation for their release on February 6, 2018. The site utilized a [render prop](https://reactjs.org/docs/render-props.html) based Slideshow component in several places as well as a handful of other class based components. Through this process, I was able to consolidate the application code and eliminate all class based components from the site's code base. The React team does not recommend refactoring your entire codebase to Hooks on their release. I did this primarily as a means to engage with the Hooks API in a relatively small codebase. You can find the code conversion to Hooks discussed in this post at the [related PR](https://github.com/dslemay/Portfolio-Site/pull/10).

## Converting to Hooks and lessons learned

The [Hooks documentation](https://reactjs.org/docs/hooks-intro.html) is well presented and an excellent resource to getting started with hooks. I previously championed the render props pattern for reusable logic and composability. However, the extra syntax often comes with tradeoffs in clarity. These concerns include: "wrapper hell" and more mental overhead to parse nested JSX structure within the component. Adding a second render prop component or ternary operator further compounds these concerns. These additional wrappers also display in the React devTools and can get out of hand. The possibility of cleaning up this syntax and providing clearer code is alluring.

```jsx
export const PureRandomQuote = ({
  data: {
    contentfulSlideshow: { slides },
  },
}) => (
  <Slideshow slides={slides}>
    {({ slideData: quote }) => (
      <div className={gridStyles} data-testid="random-quote">
        <QuoteCard>
          <div>{quote.quote}</div>
          <div className={attribution}>{`~${quote.attribution}`}</div>
        </QuoteCard>
      </div>
    )}
  </Slideshow>
)
```

Several components on the site used a Slideshow render prop component. This exposed functionality to play/pause, pass down the current index, go to the previous/next slide, or go to a specific slide in the array. This component accepted an array of slides as a prop and provided an object as the argument in the returned function. Children components used these fields for data rendering or functionality. This is a common approach to the render prop pattern.

This previous implementation had several downsides. The component tracked the timer's ID as an instance variable to clear the timeout. The slide updater function accepted a second argument, to determine if it should clear the stored timeout and create a new one. This resolves the issue of stacking timeouts. A further source of additional code was the need for a state updater function. This is a requirement when accessing the current state in the setState call to ensure that the [updates are applied correctly](https://reactjs.org/docs/react-component.html#setstate). This particular function was complex enough that it was pulled out into it's own side-loaded module. Migrating to a custom hook alleviated these concerns and others.

```javascript
// Can result in state batching issues and is an anti-pattern
const updateStateBad = () => this.setState({ count: this.state.count + 1 })

// Preferred way to reference current state in setState call
const updateStateGood = () =>
  this.setState(state => ({ count: state.count + 1 }))
```

The custom `useSlideshow` hook utilizes two different hooks to replace the functionality of the render props component: `useState` and `useEffect`. The current index and playing states are both set with their own calls to useState. The `useEffect` hook checks if the isPlaying state is true and then sets the timeout to advance the slide to the next index. It resets to the first slide after it reaches the last index. The hook clears the timeout when the current index or isPlaying state changes. The hook includes a function to update the the slide. The necessary state and functions are return in an object.

```javascript
function useSlideshow(slides, { timerLength = 5000 } = {}) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [currIndex, setCurrIndex] = useState(0)

  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(
        () => setCurrIndex((currIndex + 1) % slides.length),
        timerLength
      )

      return () => clearTimeout(timer)
    }
  }, [currIndex, isPlaying])

  const updateSlide = (direction: Direction) => {
    if (typeof direction === "number") {
      return setCurrIndex(direction)
    }

    if (direction === "next") {
      return setCurrIndex((currIndex + 1) % slides.length)
    }

    return setCurrIndex((currIndex - 1 + slides.length) % slides.length)
  }

  return {
    currIndex,
    isPlaying,
    setIsPlaying,
    updateSlide,
  }
}
```

The benefits of this structural change go beyond aesthetic cleanup. One major benefit is the cleanup and re-running of useEffect when specific properties change. This eliminates the need of storing the timeout id as a static property. It also eliminates imperative prop comparisons in `componentDidUpdate`. Instead, the function declares the data that will trigger a re-run of this side effect. If `currIndex` or `isPlaying` change, the effect will re-run. First the function will run the cleanup function to clear the timeout, and then will run the effect again. This compounds when a component requires many side effects.

The `useEffect` hook brings more clarity and organization to the side effects in your components. Class based components force you to provide your set up and tear down across three separate life cycle methods: `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount`. This often results in duplication of code. A component may use many side effects which are all placed in these same lifecycle methods. The `useEffect` Hook shifts this paradigm by isolating the functionality of a given side effect in one function. Clean up for the effect is set as a return function. This colocation allows for easier mental parsing and grouping functions by their area of concern.

An extra benefit of `useState` is the ability to reference the current state without additional syntax. With Hooks you can call `setCurrIndex((currIndex + 1) % slides.length)` rather than passing a function which returns the partial state object to update. This results in cleaner code, and eliminated the need for the side-loaded function for the Slideshow component. Converting the Slideshow from a render prop component to a custom Hook resulted in a net reduction of 76 lines of code. Other components within the site utilized class components to manage a single piece of state. Hooks allow you to reduce the boilerplate of a class based component in these circumstances. Functional components connect to state with one line of code.

## Structuring Hooks in Gatsby

Currently I am structuring all my custom hooks in a top level folder so that other components can import them from a central location. Pulling the React dependencies out of Gatsby in version 2 allows for using Hooks immediately. To begin using Hooks today, update React and React-DOM to 16.8.0. There are considerations to take with the `useEffect Hook`. If it references the window object, you need to check that window is defined to avoid Gatsby build errors. These effects would normally live in `componentDidMount` where the component hydrates in the DOM. Hooks are called in the build process. The Gatsby docs have great resources for [debugging HTML builds](/docs/debugging-html-builds/) if you encounter this issue.

```javascript
function useMediaQuery() {
  const [isMobile, setIsMobile] = useState(false)

  const handleSizeChange = ({ matches }) => setIsMobile(matches)

  useEffect(() => {
    // Window does not exist on SSR
    if (typeof window !== "undefined") {
      const mql = window.matchMedia("(max-width: 650px)")
      mql.addListener(handleSizeChange)
      setIsMobile(mql.matches) // Set initial state in DOM

      return () => mql.removeListener(handleSizeChange)
    }
  }, [])

  return { isMobile }
}
```

Hooks bring many benefits to React functional components. Specific benefits include:

- Abstracting logic with custom Hooks over render props for reduced syntax and elements in devTools
- Improved ability to share logic across components
- Ability to call `useState` without the need for state updater functions if referencing the current version of state
- Encapsulating side effects into their own function by area of concern
- Provide clean up logic for side effects in a central location compared to across three lifecycle methods

Hooks may not be the death of class based components, but they do encourage critical thought before reaching for a class component. I believe that Hooks are a meaningful shift in the way we approach React development. I can't wait to see what you will build with Hooks.
