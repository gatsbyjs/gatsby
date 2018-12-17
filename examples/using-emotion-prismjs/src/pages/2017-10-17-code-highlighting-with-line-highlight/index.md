---
title: Another Blog Post with Code Example Including Highlighted Lines
description: "Post containing a code example with syntax highlighting"
date: "2017-10-17T14:12:03.284Z"
path: /code-example-line-highlighting/
---

This post contains the same code snippet with syntax highlighting from the
previous post, but now includes highlighted lines. The highlight theme is
still same one used in the official React documentation.

```jsx
function NumberList(props) {
  // highlight-line
  const numbers = props.numbers
  const listItems = numbers.map(number => (
    // highlight-start
    <li key={number.toString()}>{number}</li>
  ))
  // highlight-end
  return <ul>{listItems}</ul>
}

const numbers = [1, 2, 3, 4, 5]
ReactDOM.render(
  <NumberList numbers={numbers} />,
  document.getElementById("root")
)
```
