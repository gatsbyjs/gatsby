import {
  IGatsbyNodeDefinition,
  IRemoteNode,
  ISourcingContext,
} from "../../types"

export async function processRemoteNode(
  // @ts-ignore
  context: ISourcingContext,
  // @ts-ignore
  def: IGatsbyNodeDefinition,
  remoteNode: IRemoteNode
): Promise<IRemoteNode> {
  // TODO: handle https://github.com/graphql/graphql-js/issues/522
  return remoteNode
}
