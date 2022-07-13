import React from "react";
// import Context from "./src/context/SearchContext";
import { SearchProvider } from "./src/context/SearchContext";
// Wraps every page in a component
export const wrapPageElement = ({ element, props }) => {
  return <SearchProvider {...props}>{element}</SearchProvider>;
};
