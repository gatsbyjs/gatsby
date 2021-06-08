import React, { useState } from "react"
import "./index.css"

import SpreadsheetsRow from "../models/spreadsheet-row"

const IndexPage = () => {
  const blankRow = { name: "", snack: "", drink: "" }
  const [rowState, setRowState] = useState([{ ...blankRow }])

  const addRow = () => {
    setRowState([...rowState, { ...blankRow }])
  }

  const handleChange = e => {
    const updatedRows = [...rowState]
    updatedRows[e.target.dataset.idx][e.target.className] = e.target.value
    setRowState(updatedRows)
  }

  return (
    <div style={{ maxWidth: 1000 }}>
      <form action="/api/sheets" method="POST">
        <input type="button" value="Add Row" onClick={addRow} />
        <div>
          <h3>Name</h3>
          <h3>Favorite Snack</h3>
          <h3>Favorite Drink</h3>
        </div>
        <div className="row-container">
          {rowState.map((val, idx) => (
            <SpreadsheetsRow
              key={`row-${idx}`}
              idx={idx}
              state={rowState[idx]}
              handleChange={handleChange}
            />
          ))}
        </div>
        <input type="submit" value="Submit" />
      </form>
    </div>
  )
}

export default IndexPage
