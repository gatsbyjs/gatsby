---
title: Interactive pages
---

One nice thing about using Gatsby for building websites vs. other tools is that itʼs easier to add interactivity to your pages. React.js was designed for Facebook.com and is used on many other world-class web applications.

You start by creating a new link to a page at `/counter`/ from your original `index.js` page component `<Link to="/counter/">Counter</Link>`.

```jsx{13-15}
import React from "react"
import { Link } from "gatsby"

export default () =>
  <div style={{ color: `tomato` }}>
    <h1>Hello Gatsby!</h1>
    <p>What a world.</p>
    <img src="https://source.unsplash.com/random/400x200" alt="" />
    <br />
    <div>
      <Link to="/page-2/">Link</Link>
    </div>
    <div>
      <Link to="/counter/">Counter</Link>
    </div>
  </div>
```

Add that link, click on it, and then you need to create a "Hello World" page component for `/counter/`. But instead of using the "functional component" form as you did before, this time you'll create a "class" component at `src/pages/counter.js`.

```jsx
import React from "react"

class Counter extends React.Component {
  render() {
    return <div>Hello Class Component</div>;
  }
}

export default Counter
```

The class form of React allows us to have component state. You'll need that for the counter.

Continuing to flesh out the counter, add two buttons: one to increment and one to decrement the count of the counter.

```jsx{5-12}
import React from "react"

class Counter extends React.Component {
  render() {
    return (
      <div>
        <h1>Counter</h1>
        <p>current count: 0</p>
        <button>plus</button>
        <button>minus</button>
      </div>
    )
  }
}

export default Counter
```

Now you have everything you need to make a nice counter.

First, set up the component state.

```jsx{4-7,13}
import React from "react"

class Counter extends React.Component {
  constructor() {
    super()
    this.state = { count: 0 }
  }

  render() {
    return (
      <div>
        <h1>Counter</h1>
        <p>current count: {this.state.count}</p>
        <button>plus</button>
        <button>minus</button>
      </div>
    )
  }
}

export default Counter
```

You're now rendering the current count from the component state.

Now you need to change the state when we click on our buttons.

```jsx{14-31}
import React from "react"

class Counter extends React.Component {
  constructor() {
    super()
    this.state = { count: 0 }
  }

  render() {
    return (
      <div>
        <h1>Counter</h1>
        <p>current count: {this.state.count}</p>
        <button
          onClick={() =>
            this.setState(prevState => ({
              count: prevState.count + 1,
            }))
          }
        >
          plus
        </button>
        <button
          onClick={() =>
            this.setState(prevState => ({
              count: prevState.count - 1,
            }))
          }
        >
          minus
        </button>
      </div>
    )
  }
}

export default Counter
```

You got a working React.js counter inside your static website! 👌
