import type { Span } from "opentracing"
import reporter from "gatsby-cli/lib/reporter"
import type { IProgram } from "../../commands/types"
import type { Runner } from "../../bootstrap/create-graphql-runner"
import type { GraphQLRunner } from "../../query/graphql-runner"
import type { Store, AnyAction } from "redux"
import type { IGatsbyState } from "../../redux/types"
import type { IGroupedQueryIds } from "../../services/types"
import type { WebsocketManager } from "../../utils/websocket-manager"

type Reporter = typeof reporter

export type IQueryRunningContext = {
  reporter?: Reporter | undefined
  program?: IProgram | undefined
  store?: Store<IGatsbyState, AnyAction> | undefined
  parentSpan?: Span | undefined
  gatsbyNodeGraphQLFunction?: Runner | undefined
  graphqlRunner?: GraphQLRunner | undefined
  pagesToBuild?: Array<string> | undefined
  pagesToDelete?: Array<string> | undefined
  queryIds?: IGroupedQueryIds | undefined
  websocketManager?: WebsocketManager | undefined
  filesDirty?: boolean | undefined
  pendingQueryRuns?: Set<string> | undefined
  currentlyHandledPendingQueryRuns?: Set<string> | undefined
}
