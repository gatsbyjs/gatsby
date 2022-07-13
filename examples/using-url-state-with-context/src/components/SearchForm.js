import React from "react";
import { useForm } from "../hooks";

const SearchForm = () => {
  const {
    inputs,
    handleInputChange,
    handleCheckbox,
    handleSubmitNavigate,
    handleSubmit,
  } = useForm();

  return (
    <form>
      <label>
        Text
        <input
          name="demoTXT"
          onChange={handleInputChange}
          value={inputs.demoTXT}
          type="text"
        ></input>
      </label>
      <div>
        <label>
          <select
            value={inputs.demoDropdown}
            onChange={handleInputChange}
            name="demoDropdown"
          >
            <option>a</option>
            <option>b</option>
            <option>c</option>
          </select>
        </label>
      </div>
      <label>
        <input
          onChange={handleCheckbox}
          name="demoCheckbox"
          type="checkbox"
          checked={inputs.demoCheckbox}
        />
        My Value
      </label>
      <div>
        <label>
          <input
            name="demoRange"
            value={inputs.demoRange}
            onChange={handleInputChange}
            type="range"
            min="1"
            max="100"
          />
        </label>
      </div>
      <button onClick={handleSubmit} type="submit">
        submit to self
      </button>
      <button onClick={handleSubmitNavigate} type="submit">
        Submit and navigate
      </button>
    </form>
  );
};

export default SearchForm;
