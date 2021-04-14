// hide-range{1-2}
import * as React from 'react'
import { render } from "react-dom"


ReactDOM.render(
  <div>
    <ul>
      <li>Not hidden</li>
      <li>Not hidden</li>
      <li>Not hidden</li>
      // hide-range{1-3}
      <li>Hidden</li>
      <li>Hidden</li>
      <li>Hidden</li>
    </ul>
  </div>,
  document.getElementById('root') // hide-line
);


// hide-next-line
console.log('Hidden')
