export interface Job {
  // The id of the job
  id: string
}

export interface Page {
  /**
   * The path of the page
   * Any valid URL. Must start with a forward slash
   */
  path: string
  /**
   * Path that Reach Router uses to match the page on the client side.
   * @see {@link docs on matchPath|/docs/gatsby-internals-terminology/#matchpath}
   */
  matchPath: string
  // The absolute path to the component for this page
  component: string
  /**
   * Context data for this page. Passed as props
   * to the component `this.props.pageContext` as well as to the graphql query
   * as graphql arguments.
   * @example
   * createPage({
   *   path: `/my-sweet-new-page/`,
   *   component: path.resolve(`./src/templates/my-sweet-new-page.js`),
   *   // The context is passed as props to the component as well
   *   // as into the component's GraphQL query.
   *   context: {
   *     id: `123456`,
   *   },
   * })
   */
  context?: Object
  internalComponentName: string
  componentChunkName: string
  updatedAt: number
}

export interface ActionOptions {
  traceId: string | null
  parentSpan: Object | null
  followsSpan: Object | null
}

export interface CreateNodeInput {
  // the target node object
  node: Object
  /**
   * @deprecated
   * the name for the field
   */
  fieldName?: string
  /**
   * @deprecated
   * the value for the field
   */
  fieldValue?: string
  /**
   * the name for the field
   */
  name?: string
  /**
   * the value for the field
   */
  value: any
}
