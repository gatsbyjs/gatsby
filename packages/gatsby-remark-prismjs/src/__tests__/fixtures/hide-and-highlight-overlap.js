// hide-range{2-3,7}
// highlight-range{5-7,9}
import * as React from 'react'
import { render } from "react-dom"
ReactDOM.render(
  <div>
    <ul>
      <li>hidden</li>
    </ul>
  </div>,
  // highlight-next-line
  document.getElementById('root')
);
