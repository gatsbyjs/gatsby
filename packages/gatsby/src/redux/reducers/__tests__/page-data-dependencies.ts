import { queriesReducer as reducer } from "../queries"

import { ICreatePageDependencyAction } from "../../types"

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
