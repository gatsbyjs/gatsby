import React from "react"
import PropTypes from "prop-types"
import Columns from "./columns"

const SpreadsheetsRow = ({ idx, state, handleChange }) => {
  const nameId = `${Columns.name}${idx}`
  const snackId = `${Columns.snack}${idx}`
  const drinkId = `${Columns.drink}${idx}`
  return (
    <div key={`row-${idx}`}>
      <input
        type="text"
        name={nameId}
        data-idx={idx}
        id={nameId}
        className={Columns.name}
        value={state.name}
        onChange={handleChange}
      />
      <input
        type="text"
        name={snackId}
        data-idx={idx}
        id={snackId}
        className={Columns.snack}
        value={state.snack}
        onChange={handleChange}
      />
      <input
        type="text"
        name={drinkId}
        data-idx={idx}
        id={drinkId}
        className={Columns.drink}
        value={state.drink}
        onChange={handleChange}
      />
    </div>
  )
}

SpreadsheetsRow.propTypes = {
  idx: PropTypes.number,
  state: PropTypes.any,
  handleChange: PropTypes.func,
}

export default SpreadsheetsRow
