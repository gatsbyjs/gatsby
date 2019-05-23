import React, { createContext, Component } from "react";

const defaultThemeState = {
  dark: false,
  toggleDark: () => {}
};

const ThemeContext = createContext(defaultThemeState);

// check if user has already selected dark mode from OS
const userPrefersDarkMode = () => {
  if (window) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches === true;
  }

  return false;
};

class ThemeProvider extends Component {
  state = {
    dark: userPrefersDarkMode()
  };

  toggleDark = () => {
    // calculate toggled state
    let isDark = !this.state.dark;
    // set mode in local storage to toggled state
    localStorage.setItem("dark", JSON.stringify(isDark));
    // update state to newly toggled state
    this.setState({ dark: isDark });
    // change class name
    this.setTheme(isDark);
  };

  setTheme = isDark => {
    document.body.className = isDark ? `dark` : `light`;
  };

  componentDidMount() {
    // check if mode is already set in local storage
    let isDark = Boolean(localStorage.getItem("dark"));

    // if it is already set/selected
    if (isDark) {
      // sync the state
      this.setState({ dark: isDark });
      // if it's not, but user prefers dark mode (OS)
    } else if (userPrefersDarkMode()) {
      // update the state accordingly
      this.setState({ dark: true });
    }

    // sync theme with state
    // doing manually to manage theme class on <body>
    this.setTheme(!!isDark);
  }

  render() {
    const { children } = this.props;
    const { dark } = this.state;
    return (
      <ThemeContext.Provider
        value={{
          isDark: dark,
          toggleDark: this.toggleDark
        }}
      >
        {children}
      </ThemeContext.Provider>
    );
  }
}

export default ThemeContext;

export { ThemeProvider };
