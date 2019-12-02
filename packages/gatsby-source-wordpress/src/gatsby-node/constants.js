export const CREATED_NODE_IDS = `WPGQL-created-node-ids`
export const LAST_COMPLETED_SOURCE_TIME = `WPGQL-last-completed-source-time`

export const FIELD_BLACKLIST = [
  `revisions`,
  `themes`,
  `userRoles`,
  `actionMonitorActions`,
  // `alots`,
  // this causes an error on the WPGQL side
  `postTypeInfo`,
]
