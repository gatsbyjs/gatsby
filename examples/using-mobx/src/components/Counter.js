import React, { useContext } from "react"
import { MobXProviderContext, observer } from "mobx-react"

const Counter = observer(() => {
  const store = useContext(MobXProviderContext)
  return (
    <>
      <div>Counted to: {store.Count}</div>
      <div>
        <button onClick={() => store.Increment()}>Add</button>
        <button onClick={() => store.Decrement()}>Subtract</button>
      </div>
    </>
  )
})

export default Counter
