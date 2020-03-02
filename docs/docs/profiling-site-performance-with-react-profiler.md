---
title: Profiling Site Performance with React Profiler
---

React profiling captures timing information that can help identify performance issues within your gatsby site.

## Requirements

React's profiling API was introduced in **React 16.5**. Therefore you must be running React 16.5 or higher.

## Using the profiler

Profiling will be enabled automatically in Development. If you have React DevTools it will [show a “Profiler” tab](https://reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html#profiling-an-application). Caution should be given to the validity of profiling within Development as this does not reflect the performance of the Production build and therefore the experience of your users.

To enable profiling for a Production build an additional CLI option `--profile` must be provided when running the build command. See [gatsby build command](/docs/gatsby-cli/#options-1) for further information.

## Performance impact

Although Profiler is a light-weight component, it should be used only when necessary; each use adds some CPU and memory overhead to an application.

A warning will be issued in a Gatsby Production build if the `--profile` options is provided.

## Example: Profile Gatsby pages

Capturing page performance can be achieved by using the [wrapPageElement API](/docs/browser-apis/#wrapPageElement) to profile each page.

```js
//gatsby-browser.js

import * as React from "react"
import { Profiler } from "react"

const capturePageMetrics = (
  id, // the "id" prop of the Profiler tree that has just committed
  phase, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
  actualDuration, // time spent rendering the committed update
  baseDuration, // estimated time to render the entire subtree without memoization
  startTime, // when React began rendering this update
  commitTime, // when React committed this update
  interactions // the Set of interactions belonging to this update
) => {
  // Aggregate or log render timings...
}

export const wrapPageElement = ({ element, props }) => (
  <Profiler id={props.someUniqueId} onRender={capturePageMetrics}>
    {element}
  </Profiler>
)
```

The above is just an example, the react profiler can be used anywhere in a react tree to measure the performance of that part of the tree.

### References:

- [React Profiler](https://reactjs.org/docs/profiler.html)
- [React Profiler Introduction Blog](https://reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html)
