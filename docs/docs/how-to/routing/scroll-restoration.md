---
title: Scroll Restoration
---

Scroll restoration refers to the [`scrollRestoration`](https://developer.mozilla.org/en-US/docs/Web/API/History/scrollRestoration) property on the [`History`](https://developer.mozilla.org/en-US/docs/Web/API/History) API. This property allows restoring a user's scroll position when navigating to a new page.

Gatsby will handle scroll restoration for you in most cases. However, when you render containers that have their own scroll values, those scroll positions are typically lost between page transitions. To solve that, users can use the `useScrollRestoration` hook in their code to tell Gatsby about scroll containers that we should track and restore.

Here is an example of using the `useScrollRestoration` hook to render a list of countries in an overflow `ul` element.

```jsx
import { useScrollRestoration } from "gatsby"
import countryList from "../utils/country-list"

export default function PageComponent() {
  const ulScrollRestoration = useScrollRestoration(`page-component-ul-list`)

  return (
    <ul style={{ height: 200, overflow: `auto` }} {...ulScrollRestoration}>
      {countryList.map(country => (
        <li>{country}</li>
      ))}
    </ul>
  )
}
```
