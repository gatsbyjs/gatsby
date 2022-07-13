import React, { useState, useEffect } from "react";
import { navigate } from "gatsby";
import { parse, stringify } from "query-string";

const SearchContext = React.createContext();

const DEFAULT_PARAMS_QUERY = {
  utm_source: "demoUTM",
};

const hasUtm = parsedQuery => {
  /* Example for deafult params / first time visitor */
  if (parsedQuery.utm_source && parsedQuery.utm_source.length > 1) {
    return true;
  }
  return false;
};

export function SearchProvider({ children, location }) {
  const [searchData, setSearchData] = useState({});

  useEffect(() => {
    const parsedQuery = parse(location.search, { parseBooleans: true });
    if (hasUtm(parsedQuery)) {
      setSearchData({ ...searchData, ...parsedQuery }); // sync
    } else {
      setNewUrl({
        ...DEFAULT_PARAMS_QUERY,
        ...searchData,
      });
    }
  }, [location]);

  const setNewUrl = (newParam, newPath = null) => {
    let newQuery;
    let path = location.pathname;

    if (newPath && newPath !== path.slice(1)) path = newPath;

    const currentParam = parse(location.search, { parseBooleans: true });

    newQuery = `?${stringify(
      {
        ...currentParam,
        ...newParam,
      },
      { arrayFormat: "comma" }
    )}`;
    navigate(`${path}${newQuery}`);
  };

  const value = {
    searchData,
    currentPath: location.path,
    setNewUrl,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

export default SearchContext;
