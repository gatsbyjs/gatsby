# Using @reach/skip-nav

Demonstrates the usage of [@reach/skip-nav](https://reacttraining.com/reach-ui/skip-nav/)

## Add SkipNavLink and SkipNavContent to your Layout

```javascript:layout.js
import { SkipNavLink, SkipNavContent } from "@reach/skip-nav"
import "@reach/skip-nav/styles.css" //this will show/hide the link on focus
;<>
  <SkipNavLink /> //put the link at the very top of your page
  <Navigation />
  <Header />
  <SkipNavContent /> //the link will drop the user here, so put it right before your
  main content
  <main>This is the main page content.</main>
  <Footer />
</>
```

## Focus your link on page navigation

```javascript:gatsby-browser.js
export const onRouteUpdate = ({ location, prevLocation }) => {
  if (prevLocation !== null) {
    const skipLink = document.querySelector("[data-reach-skip-link]") //this is the query selector that comes with the <SkipNavLink> component
    if (skipLink) {
      skipLink.focus()
    }
  }
}
```
