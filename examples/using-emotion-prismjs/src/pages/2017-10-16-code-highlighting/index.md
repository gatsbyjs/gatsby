---
title: Blog Post with Code Example
description: "Post containing a code example with syntax highlighting"
date: "2017-10-16T15:12:03.284Z"
path: /code-example-line-highlighting/
---

This post contains the same code snippet with synatax hightlighting from the
previous post, but now includes highlighted lines. The highlight theme and is
still same one used in the official React documentation.

```jsx{1,4-6}
function NumberList(props) {
  const numbers = props.numbers;
  const listItems = numbers.map((number) =>
    <li key={number.toString()}>
      {number}
    </li>
  );
  return (
    <ul>{listItems}</ul>
  );
}

const numbers = [1, 2, 3, 4, 5];
ReactDOM.render(
  <NumberList numbers={numbers} />,
  document.getElementById('root')
);
```
