import { useState, useEffect, useContext } from "react";
import SearchContext from "../context/SearchContext";
const DEFAULT_PARAMS = {
  demoTXT: "txt",
  demoCheckbox: false,
  demoDropdown: "",
  demoRange: "0",
};

export function useForm() {
  const [inputs, setInputs] = useState(DEFAULT_PARAMS);
  const { searchData, setNewUrl } = useContext(SearchContext);

  useEffect(() => {
    //sync state from url-to-state context to our hook form
    setInputs({ ...DEFAULT_PARAMS, ...searchData });
  }, [searchData]);

  const handleSubmit = e => {
    e.preventDefault();

    const newQuery = { ...inputs };

    setNewUrl(newQuery);
  };

  const handleSubmitNavigate = e => {
    e.preventDefault();
    const newQuery = { ...inputs };
    setNewUrl(newQuery, "search");
  };

  const handleCheckbox = () => {
    setInputs({ ...inputs, demoCheckbox: !inputs.demoCheckbox });
  };

  const handleInputChange = e => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  return {
    handleSubmit,
    handleInputChange,
    handleCheckbox,
    handleSubmitNavigate,
    inputs,
  };
}
