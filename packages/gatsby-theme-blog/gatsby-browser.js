import React from "react";
// custom typefaces
import "typeface-montserrat";
import "typeface-merriweather";

import { ThemeProvider } from "./src/context/theme-context";

export const wrapRootElement = ({ element }) => (
  <ThemeProvider>{element}</ThemeProvider>
);
