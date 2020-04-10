// hide-range{2-3,10-12,18}
// highlight-range{6-8}
import * as React from 'react'
import { render } from "react-dom"
ReactDOM.render(
  <div>
    <ul>
      <li>Not hidden and highlighted</li>
      <li>Not hidden and highlighted</li>
      <li>Not hidden and highlighted</li>
      <li>Hidden</li>
      <li>Hidden</li>
      <li>Hidden</li>
    </ul>
  </div>,
  // highlight-next-line
  document.getElementById('root')
);
console.log('Hidden')
