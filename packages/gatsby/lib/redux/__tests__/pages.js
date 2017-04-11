const { store, reducer } = require("../index");
const { actions, boundActions } = require("../actions");

describe(`Add pages`, () => {
  it(`allows you to add pages`, () => {
    const action = actions.upsertPage({
      path: `/hi/`,
      component: `/whatever/index.js`,
    });
    const state = reducer({ pages: [] }, action);
    expect(action).toMatchSnapshot();
    expect(state).toMatchSnapshot();
  });

  it(`allows you to add pages with context`, () => {
    const action = actions.upsertPage({
      path: `/hi/`,
      component: `/whatever/index.js`,
      context: {
        id: 123,
      },
    });
    const state = reducer({ pages: [] }, action);
    expect(action).toMatchSnapshot();
    expect(state).toMatchSnapshot();
  });

  it(`allows you to add multiple pages`, () => {
    const action = actions.upsertPage({
      path: `/hi/`,
      component: `/whatever/index.js`,
    });
    const action2 = actions.upsertPage({
      path: `/hi/pizza/`,
      component: `/whatever/index.js`,
    });
    let state = reducer({ pages: [] }, action);
    state = reducer(state, action2);
    expect(state).toMatchSnapshot();
    expect(state.pages.length).toEqual(2);
  });

  it(`allows you to update existing pages (based on path)`, () => {
    const action = actions.upsertPage({
      path: `/hi/`,
      component: `/whatever/index.js`,
    });

    // Change the component
    const action2 = actions.upsertPage({
      path: `/hi/`,
      component: `/whatever2/index.js`,
    });

    let state = reducer({ pages: [] }, action);
    state = reducer(state, action2);
    expect(state).toMatchSnapshot();
    expect(state.pages.length).toEqual(1);
  });
});
