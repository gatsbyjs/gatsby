/* eslint-disable @typescript-eslint/no-explicit-any */
import { findTypeName } from "~/steps/create-schema-customization/helpers"

interface IRemoteSchemaState {
  wpUrl: string
  nodeQueries: any
  nonNodeQuery: string
  introspectionData: any
  schemaWasChanged: boolean
  typeMap: any
  nodeListFilter: (field: { name: string }) => boolean
  ingestibles: {
    nodeListRootFields: any
    nodeInterfaceTypes: any
    nonNodeRootFields: Array<any>
  }
  allowRefreshSchemaUpdate: boolean
  fetchedTypes: any
  fieldBlacklist: Array<string>
  fieldAliases: {
    parent: string
    children: string
    internal: string
    plugin: string
    actionOptions: string
  }
}

interface IRemoteSchemaReducers {
  toggleAllowRefreshSchemaUpdate: (
    state: IRemoteSchemaState
  ) => IRemoteSchemaState

  setSchemaWasChanged: (
    state: IRemoteSchemaState,
    payload: boolean
  ) => IRemoteSchemaState

  addFieldsToBlackList: (
    state: IRemoteSchemaState,
    payload: Array<string>
  ) => IRemoteSchemaState

  setState: (
    state: IRemoteSchemaState,
    payload: IRemoteSchemaState
  ) => IRemoteSchemaState

  addFetchedType: (state: IRemoteSchemaState, type: any) => IRemoteSchemaState
}

interface IRemoteSchemaStore {
  state: IRemoteSchemaState
  reducers: IRemoteSchemaReducers
}

const remoteSchema: IRemoteSchemaStore = {
  state: {
    wpUrl: null,
    nodeQueries: {},
    nonNodeQuery: null,
    introspectionData: null,
    schemaWasChanged: null,
    typeMap: null,
    nodeListFilter: (field: { name: string }): boolean =>
      field.name === `nodes`,
    ingestibles: {
      nodeListRootFields: null,
      nodeInterfaceTypes: null,
      nonNodeRootFields: [],
    },
    allowRefreshSchemaUpdate: false,
    fetchedTypes: new Map(),
    fieldBlacklist: [
      `isWpGatsby`,
      `edges`,
      // these aren't useful without authentication
      `revisions`,
      `isJwtAuthSecretRevoked`,
      `isRestricted`,
      `jwtAuthExpiration`,
      `jwtAuthToken`,
      `jwtRefreshToken`,
      `jwtUserSecret`,
      `editLock`,
      `revisionOf`,
      `preview`,
      `isPreview`,
      `previewRevisionDatabaseId`,
      `previewRevisionId`,
      `editingLockedBy`,
    ],
    // @todo make this a plugin option
    fieldAliases: {
      parent: `wpParent`,
      children: `wpChildren`,
      internal: `wpInternal`,
      plugin: `wpPlugin`,
      actionOptions: `wpActionOptions`,
      fields: `wpFields`,
    },
  },

  reducers: {
    toggleAllowRefreshSchemaUpdate(state) {
      state.allowRefreshSchemaUpdate = !state.allowRefreshSchemaUpdate

      return state
    },

    setSchemaWasChanged(state, payload) {
      state.schemaWasChanged = !!payload

      return state
    },

    addFieldsToBlackList(state, payload) {
      state.fieldBlacklist = [...state.fieldBlacklist, ...payload]
      return state
    },

    setState(state, payload) {
      state = {
        ...state,
        ...payload,
      }

      return state
    },

    addFetchedType(state, type) {
      const key = findTypeName(type)

      if (!key) {
        return state
      }

      type = state.typeMap.get(key)

      // union types with no member types will cause schema customization errors
      // @todo move this to a better place. This should be excluded before it gets to this point.
      if (type && type.kind === `UNION` && type.possibleTypes.length === 0) {
        return state
      }

      state.fetchedTypes.set(key, type)

      return state
    },
  } as IRemoteSchemaReducers,
}

export default remoteSchema
