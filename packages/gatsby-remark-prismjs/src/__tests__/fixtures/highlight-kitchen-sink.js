import React, { Component } from "react" // highlight-line
export default function Counter() {
  const updateCount = () => {
    this.setState(state => ({
      // highlight-next-line
      count: state.count + 1,
    }))
  };

  return (
// highlight-line
<div>
<span>clicked {count}</span>
{/* highlight-start */}
<button onClick={updateCount}>Click me</button>
{/* highlight-end */}
</div>
);
}
