import { queriesReducer as reducer } from "../queries"
import {
  queryStart,
  pageQueryRun,
  replaceStaticQuery,
} from "../../actions/internal"

import {
  ICreatePageAction,
  ICreatePageDependencyAction,
  IGatsbyPage,
  IGatsbyState,
  IPageQueryRunAction,
  IQueryStartAction,
} from "../../types"

type QueriesState = IGatsbyState["queries"]

let state: QueriesState
let Pages
let StaticQueries
beforeEach(() => {
  state = reducer(undefined, `@@setup` as any)
  Pages = {
    foo: {
      path: `/foo`,
      componentPath: `/foo.js`,
      component: `/foo.js`,
    },
    bar: {
      path: `/bar`,
      componentPath: `/bar.js`,
      component: `/bar.js`,
    },
  }
  StaticQueries = {
    q1: {
      id: `sq--q1`,
      name: `q1-name`,
      componentPath: `/static-query-component1.js`,
      query: `{ allFoo { nodes { foo } } }`,
      hash: `q1-hash`,
    },
    q2: {
      id: `sq--q2`,
      name: `q2-name`,
      componentPath: `/static-query-component2.js`,
      query: `{ allBar { nodes { bar } } }`,
      hash: `q2-hash`,
    },
  }
})

it(`has expected initial state`, () => {
  expect(state).toMatchInlineSnapshot(`
    Object {
      "byConnection": Map {},
      "byNode": Map {},
      "trackedComponents": Map {},
      "trackedQueries": Map {},
    }
  `)
})

describe(`create page`, () => {
  it(`starts tracking page query`, () => {
    state = createPage(state, Pages.foo)
    expect(state.trackedQueries.has(`/foo`))
  })

  it(`marks new page query as dirty`, () => {
    state = createPage(state, Pages.foo)
    state = createPage(state, Pages.bar)

    expect(state).toMatchObject({
      trackedQueries: new Map([
        [`/foo`, { dirty: 1, errors: 0 }],
        [`/bar`, { dirty: 1, errors: 0 }],
      ]),
    })
  })

  it(`does not mark existing page query as dirty`, () => {
    state = createPage(state, Pages.foo)
    state = runQuery(state, { path: Pages.foo.path })
    expect(state.trackedQueries.get(`/foo`)!.dirty).toEqual(0) // sanity-check
    state = createPage(state, Pages.foo)

    expect(state.trackedQueries.get(`/foo`)).toEqual({
      dirty: 0,
      errors: 0,
    })
  })

  it(`marks existing page query with modified context as dirty`, () => {
    state = createPage(state, Pages.foo)
    state = runQuery(state, { path: Pages.foo.path })
    expect(state.trackedQueries.get(`/foo`)!.dirty).toEqual(0) // sanity-check
    state = createPage(state, Pages.foo, { contextModified: true })

    expect(state.trackedQueries.get(`/foo`)).toEqual({
      dirty: 1,
      errors: 0,
    })
  })

  it(`binds every page with corresponding component`, () => {
    state = createPage(state, Pages.foo)
    state = createPage(state, Pages.bar)

    expect(Array.from(state.trackedComponents.keys())).toEqual([
      `/foo.js`,
      `/bar.js`,
    ])
    expect(state.trackedComponents.get(`/foo.js`)).toEqual({
      componentPath: `/foo.js`,
      pages: new Set([`/foo`]),
      query: ``,
    })
    expect(state.trackedComponents.get(`/bar.js`)).toEqual({
      componentPath: `/bar.js`,
      pages: new Set([`/bar`]),
      query: ``,
    })
  })

  it(`does not affect data tracking`, () => {
    state = createPage(state, Pages.foo)

    expect(state).toMatchObject({
      byNode: new Map(),
      byConnection: new Map(),
    })
  })
})

describe(`delete page`, () => {
  beforeEach(() => {
    state = createPage(state, Pages.foo)
    state = createPage(state, Pages.bar)
  })

  it(`removes page query from tracked queries`, () => {
    state = deletePage(state, Pages.foo)

    expect(state.trackedQueries.has(`/foo`)).toEqual(false)
    expect(state.trackedQueries.has(`/bar`)).toEqual(true) // sanity check
  })

  it(`removes page query from tracked component pages`, () => {
    state = deletePage(state, Pages.foo)

    expect(state.trackedComponents.get(`/foo.js`)).toMatchObject({
      pages: new Set([]),
    })
    // sanity check:
    expect(state.trackedComponents.get(`/bar.js`)).toMatchObject({
      pages: new Set([`/bar`]),
    })
  })

  it(`does not affect data tracking`, () => {
    state = deletePage(state, Pages.foo)

    expect(state).toMatchObject({
      byNode: new Map(),
      byConnection: new Map(),
    })
  })
})

describe(`replace static query`, () => {
  it(`starts tracking new static query`, () => {
    state = reducer(state, replaceStaticQuery(StaticQueries.q1))
    state = reducer(state, replaceStaticQuery(StaticQueries.q2))

    expect([...state.trackedQueries.keys()]).toEqual([`sq--q1`, `sq--q2`])
  })

  it(`marks new static query text as dirty`, () => {
    state = reducer(state, replaceStaticQuery(StaticQueries.q1))

    expect(state).toMatchObject({
      trackedQueries: new Map([[`sq--q1`, { dirty: 2, errors: 0 }]]),
    })
  })

  it(`marks existing static query text as dirty`, () => {
    // We do this even if actual static query text hasn't changed
    // (assuming this action is only called when query text changes internally)
    // FIXME: probably we shouldn't invalidate query text if it didn't actually change
    state = reducer(state, replaceStaticQuery(StaticQueries.q1))
    state = runQuery(state, {
      path: StaticQueries.q1.id,
      componentPath: StaticQueries.q1.componentPath,
      isPage: false,
    })
    expect(state.trackedQueries.get(`sq--q1`)!.dirty).toEqual(0) // sanity-check

    state = reducer(state, replaceStaticQuery(StaticQueries.q1))
    expect(state.trackedQueries.get(`sq--q1`)).toEqual({
      dirty: 2,
      errors: 0,
    })
  })

  // TODO: currently we track static query components in a separate "static-query-components" reducer
  //   Instead we should track all query relations uniformly in "queries" reducer.
  //   Then this test will make sense
  it.skip(`bind static query with corresponding component`, () => {
    state = reducer(state, replaceStaticQuery(StaticQueries.q1))
    state = reducer(state, replaceStaticQuery(StaticQueries.q2))

    expect(Array.from(state.trackedComponents.keys())).toEqual([
      `/static-query-component1.js`,
      `/static-query-component2.js`,
    ])
    expect(state.trackedComponents.get(`/static-query-component1.js`)).toEqual({
      componentPath: `/static-query-component1.js`,
      pages: new Set(),
      staticQueries: new Set([`sq--q1`]),
      query: ``,
    })
    expect(state.trackedComponents.get(`/static-query-component2.js`)).toEqual({
      componentPath: `/static-query-component2.js`,
      pages: new Set(),
      staticQueries: new Set([`sq--q2`]),
      query: ``,
    })
  })
})

describe(`remove static query`, () => {
  beforeEach(() => {
    state = reducer(state, replaceStaticQuery(StaticQueries.q1))
    state = reducer(state, replaceStaticQuery(StaticQueries.q2))
  })

  it(`removes static query from tracked queries`, () => {
    state = removeStaticQuery(state, StaticQueries.q1.id)
    expect([...state.trackedQueries.keys()]).toEqual([`sq--q2`])
  })

  // TODO: see a note in the "replace static query"
  it.skip(`removes binding of static query with corresponding component`, () => {
    state = removeStaticQuery(state, StaticQueries.q1.id)

    expect(
      state.trackedComponents.get(`/static-query-component1.js`)
    ).toMatchObject({
      staticQueries: new Set([]),
    })
    // sanity check:
    expect(
      state.trackedComponents.get(`/static-query-component2.js`)
    ).toMatchObject({
      staticQueries: new Set([`sq--q2`]),
    })
  })
})

describe(`query extraction`, () => {})

describe(`add page data dependency`, () => {
  it(`lets you add a node dependency`, () => {
    const action: ICreatePageDependencyAction = {
      type: `CREATE_COMPONENT_DEPENDENCY`,
      payload: {
        path: `/hi/`,
        nodeId: `123`,
      },
    }

    expect(reducer(undefined, action)).toMatchObject({
      byConnection: new Map(),
      byNode: new Map([[`123`, new Set([`/hi/`])]]),
    })
  })
  it(`lets you add a node dependency to multiple paths`, () => {
    const action: ICreatePageDependencyAction = {
      type: `CREATE_COMPONENT_DEPENDENCY`,
      payload: {
        path: `/hi/`,
        nodeId: `1.2.3`,
      },
    }
    const action2: ICreatePageDependencyAction = {
      type: `CREATE_COMPONENT_DEPENDENCY`,
      payload: {
        path: `/hi2/`,
        nodeId: `1.2.3`,
      },
    }
    const action3: ICreatePageDependencyAction = {
      type: `CREATE_COMPONENT_DEPENDENCY`,
      payload: {
        path: `/blog/`,
        nodeId: `1.2.3`,
      },
    }

    let state = reducer(undefined, action)
    state = reducer(state, action2)
    state = reducer(state, action3)

    expect(state).toMatchObject({
      byConnection: new Map(),
      byNode: new Map([[`1.2.3`, new Set([`/hi/`, `/hi2/`, `/blog/`])]]),
    })
  })
  it(`lets you add a connection dependency`, () => {
    const action: ICreatePageDependencyAction = {
      type: `CREATE_COMPONENT_DEPENDENCY`,
      payload: {
        path: `/hi/`,
        connection: `Markdown.Remark`,
      },
    }
    const action2: ICreatePageDependencyAction = {
      type: `CREATE_COMPONENT_DEPENDENCY`,
      payload: {
        path: `/hi2/`,
        connection: `Markdown.Remark`,
      },
    }

    let state = reducer(undefined, action)
    state = reducer(state, action2)

    expect(state).toMatchObject({
      byConnection: new Map([[`Markdown.Remark`, new Set([`/hi/`, `/hi2/`])]]),
      byNode: new Map(),
    })
  })
  it(`removes duplicate paths`, () => {
    const action: ICreatePageDependencyAction = {
      type: `CREATE_COMPONENT_DEPENDENCY`,
      payload: {
        path: `/hi/`,
        nodeId: `1`,
        connection: `MarkdownRemark`,
      },
    }
    const action2: ICreatePageDependencyAction = {
      type: `CREATE_COMPONENT_DEPENDENCY`,
      payload: {
        path: `/hi2/`,
        nodeId: `1`,
        connection: `MarkdownRemark`,
      },
    }

    let state = reducer(undefined, action)
    // Do it again
    state = reducer(state, action)
    // Add different action
    state = reducer(state, action2)

    expect(state.byConnection.get(`MarkdownRemark`)?.size).toEqual(2)
    expect(state.byNode.get(`1`)?.size).toEqual(2)
  })
  it(`lets you add both a node and connection in one action`, () => {
    const action: ICreatePageDependencyAction = {
      type: `CREATE_COMPONENT_DEPENDENCY`,
      payload: {
        path: `/hi/`,
        connection: `MarkdownRemark`,
        nodeId: `SuperCoolNode`,
      },
    }

    const state = reducer(undefined, action)

    expect(state).toMatchSnapshot()
  })
})

describe(`TODO`, () => {
  it.todo(`handles not running queries during bootstrap`)
  it.todo(`won't run queries if the page component has a JS error`)
  it.todo(`won't queue extra query if new page is created in bootstrap`)
  it.todo(`will queue query if new page is created after bootstrap`)
  it.todo(`will queue query when page context is changed`)
})

function createPage(
  state: QueriesState,
  page: Partial<IGatsbyPage>,
  other: Partial<ICreatePageAction> = {}
): QueriesState {
  return reducer(state, {
    type: `CREATE_PAGE`,
    payload: page as IGatsbyPage,
    ...other,
  })
}

function deletePage(
  state: QueriesState,
  page: Partial<IGatsbyPage>
): QueriesState {
  return reducer(state, {
    type: `DELETE_PAGE`,
    payload: page as IGatsbyPage,
  })
}

function runQuery(
  state: QueriesState,
  payload: Partial<IQueryStartAction["payload"]>
): QueriesState {
  const tmp = startQuery(state, payload)
  return finishQuery(tmp, payload)
}

function startQuery(
  state: QueriesState,
  payload: Partial<IQueryStartAction["payload"]>
): QueriesState {
  return reducer(
    state,
    queryStart(payload as IQueryStartAction["payload"], {} as any)
  )
}

function finishQuery(
  state: QueriesState,
  payload: Partial<IPageQueryRunAction["payload"]>
): QueriesState {
  return reducer(
    state,
    pageQueryRun(payload as IPageQueryRunAction["payload"], {} as any)
  )
}

function removeStaticQuery(state: QueriesState, queryId: string): QueriesState {
  return reducer(state, {
    type: `REMOVE_STATIC_QUERY`,
    payload: queryId,
  })
}
