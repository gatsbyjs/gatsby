import React, { Fragment } from "react"
import { observer, inject } from "mobx-react"

const Counter = inject(`store`)(
  observer(({ store }) => (
    <Fragment>
      <div>Counted to: {store.Count}</div>
      <div>
        <button onClick={() => store.Increment()}>Add</button>
        <button onClick={() => store.Decrement()}>Subtract</button>
      </div>
    </Fragment>
  ))
)

export default Counter
