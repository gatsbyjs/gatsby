import { store } from "../index.js";

describe(`add site config`, () => {
  it(`allow you to add basic site config`, () => {
    const config = {
      siteMetadata: {
        title: "yo testing",
      },
      plugins: [],
    };
    store.dispatch({
      type: "SET_SITE_CONFIG",
      payload: config,
    });
    expect(store.getState()).toMatchSnapshot();
  });

  it(`Validates configs with unsupported options`, () => {
    const config = {
      someRandomThing: "hi people",
      plugins: [],
    };
    store.dispatch({
      type: "SET_SITE_CONFIG",
      payload: config,
    });
    expect(store.getState()).toMatchSnapshot();
  });
});
