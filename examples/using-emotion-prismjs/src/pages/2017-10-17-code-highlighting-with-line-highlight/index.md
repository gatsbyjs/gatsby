---
title: Another Blog Post with Code Example Including Highlighted Lines
description: "Post containing a code example with syntax highlighting"
date: "2017-10-17T14:12:03.284Z"
path: /code-example/
---

This post contains a code snippet with synatax hightlighting. The highlight
theme and is the same one used in the official React documentation.

```jsx
function NumberList(props) {
  const numbers = props.numbers;
  const listItems = numbers.map(number => (
    <li key={number.toString()}>{number}</li>
  ));
  return <ul>{listItems}</ul>;
}

const numbers = [1, 2, 3, 4, 5];
ReactDOM.render(
  <NumberList numbers={numbers} />,
  document.getElementById("root")
);
```
